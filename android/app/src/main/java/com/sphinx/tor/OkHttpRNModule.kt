package com.sphinx.tor

import com.facebook.react.bridge.*
import com.sphinx.BuildConfig
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.net.InetSocketAddress
import java.net.Proxy
import java.util.concurrent.TimeUnit

class OkHttpRNModule private constructor(
    reactContext: ReactApplicationContext
): ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    companion object {
        @Volatile
        private var instance: OkHttpRNModule? = null

        @JvmStatic
        fun getInstance(reactContext: ReactApplicationContext): OkHttpRNModule =
            instance ?: synchronized(this) {
                instance ?: OkHttpRNModule(reactContext)
                        .also { instance = it }
            }

        const val NAME = "OkHttpRNModule"

        // Builder rejection codes
        private const val BUILDER_CODE = "BUILDER_CODE"
        const val CLIENT_EXISTS = "${BUILDER_CODE}_CLIENT_EXISTS"
        const val PROXY_ERROR = "${BUILDER_CODE}_PROXY_ERROR"
        const val TIME_OUT = 20L
        const val PING_INTERVAL = 30L

        // Request rejection codes
        private const val REQUEST_CODE = "REQUEST_CODE"
        const val CALL_EXCEPTION = "${REQUEST_CODE}_CALL_EXCEPTION"
        const val CLIENT_EXCEPTION = "${REQUEST_CODE}_CLIENT_EXCEPTION"
        const val HEADER_EXCEPTION = "${REQUEST_CODE}_HEADER_EXCEPTION"
        const val REQUEST_CANCELLATION = "${REQUEST_CODE}_REQUEST_CANCELLATION"

        // Request resolution map keys
        const val RESPONSE_HEADERS = "RESPONSE_HEADERS"
        const val RESPONSE_CODE = "RESPONSE_CODE"
        const val RESPONSE_BODY = "RESPONSE_BODY"
    }

    private var client: OkHttpClient? = null

    private var supervisor: Job = SupervisorJob()
    private var clientScope: CoroutineScope = CoroutineScope(supervisor)

    /**
     * Builds the OkHttp client using the provided socks address.
     *
     * @param [socksAddress] example: 127.0.0.1:9050
     * */
    @ReactMethod
    @Synchronized
    fun buildClient(
        socksAddress: String,
        promise: Promise
    ) {
        if (client != null) {
            promise.reject(
                CLIENT_EXISTS,
                "Client is already built. Use clearClient"
            )
        }

        val proxy: Proxy = try {
            socksAddress.split(":").let { splits ->
                if (splits.size != 2) {
                    promise.reject(
                        PROXY_ERROR,
                        "Invalid socks address format. Use <address>:<port>"
                    )
                    return
                }

                Proxy(Proxy.Type.SOCKS, InetSocketAddress(splits[0], splits[1].toInt()))
            }
        } catch (e: Exception) {
            promise.reject(PROXY_ERROR, e)
            return
        }

        val builder = OkHttpClient.Builder()
            .callTimeout(TIME_OUT * 3, TimeUnit.SECONDS)
            .connectTimeout(TIME_OUT, TimeUnit.SECONDS)
            .readTimeout(TIME_OUT, TimeUnit.SECONDS)
            .writeTimeout(TIME_OUT, TimeUnit.SECONDS)
            .pingInterval(PING_INTERVAL, TimeUnit.SECONDS)
            .proxy(proxy)

        if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor().let { interceptor ->
                interceptor.level = HttpLoggingInterceptor.Level.BODY
                builder.addNetworkInterceptor(interceptor)
            }
        }

        builder.build()
            .also { client = it }

        promise.resolve(true)
    }

    /**
     * Will set the [client] to null and cancel all active requests
     * */
    @ReactMethod
    @Synchronized
    fun clearClient() {
        client = null
        supervisor.cancel()
        supervisor = SupervisorJob()
            .also { clientScope = CoroutineScope(it) }
    }

    @ReactMethod
    fun requestGet(
        url: String,
        headers: ReadableMap,
        promise: Promise,
    ) {
        client?.let { nnClient ->
            val request = buildRequest(url, headers, promise) ?: return
            makeCall(nnClient, request.build(), promise)
        } ?: promise.reject(CLIENT_EXCEPTION, "Client is not built yet")
    }

    @ReactMethod
    fun requestPut(
        url: String,
        headers: ReadableMap,
        jsonBody: String,
        promise: Promise,
    ) {
        client?.let { nnClient ->
            val request = buildRequest(url, headers, promise) ?: return
            request.put(jsonBody.toRequestBody())

            makeCall(nnClient, request.build(), promise)
        } ?: promise.reject(CLIENT_EXCEPTION, "Client is not built yet")
    }

    @ReactMethod
    fun requestPost(
        url: String,
        headers: ReadableMap,
        jsonBody: String,
        promise: Promise,
    ) {
        client?.let { nnClient ->
            val request = buildRequest(url, headers, promise) ?: return
            request.post(jsonBody.toRequestBody())

            makeCall(nnClient, request.build(), promise)
        } ?: promise.reject(CLIENT_EXCEPTION, "Client is not built yet")
    }

    @ReactMethod
    fun requestDelete(
        url: String,
        headers: ReadableMap,
        jsonBody: String?,
        promise: Promise,
    ) {
        client?.let { nnClient ->
            val request = buildRequest(url, headers, promise) ?: return

            if (jsonBody != null) {
                request.delete(jsonBody.toRequestBody())
            } else {
                request.delete()
            }

            makeCall(nnClient, request.build(), promise)
        } ?: promise.reject(CLIENT_EXCEPTION, "Client is not built yet")
    }

    private fun buildRequest(url: String, headers: ReadableMap, promise: Promise): Request.Builder? {
        val builder = Request.Builder()
                .url(url)

        return try {
            for (header in headers.toHashMap()) {
                builder.addHeader(header.key, header.value as String)
            }
            builder
        } catch (e: Exception) {
            promise.reject(HEADER_EXCEPTION, e)
            null
        }
    }

    private fun makeCall(client: OkHttpClient, request: Request, promise: Promise) {
        val job = clientScope.launch(Dispatchers.IO) {
            try {
                client.newCall(request).execute().let { response ->
                    val map = Arguments.createMap()
                    val headersMap = Arguments.createMap()

                    response.headers.toMultimap().map {
                        headersMap.putArray(it.key, Arguments.fromList(it.value))
                    }

                    map.putMap(RESPONSE_HEADERS, headersMap)
                    map.putInt(RESPONSE_CODE, response.code)
                    map.putString(RESPONSE_BODY, response.body?.string())
                    promise.resolve(map)
                }
            } catch (e: Exception) {
                promise.reject(CALL_EXCEPTION, e)
            }
        }

        job.invokeOnCompletion {
            if (job.isCancelled) {
                promise.reject(REQUEST_CANCELLATION, "Request was cancelled")
            }
        }
    }

}
