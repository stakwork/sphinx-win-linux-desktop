package com.sphinx.tor

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import io.matthewnelson.topl_service_base.BaseServiceConsts.ServiceLifecycleEvent
import io.matthewnelson.topl_core_base.BaseConsts.TorNetworkState
import io.matthewnelson.topl_core_base.BaseConsts.TorState
import io.matthewnelson.topl_service.TorServiceController
import io.matthewnelson.topl_service_base.TorPortInfo
import io.matthewnelson.topl_service_base.TorServiceEventBroadcaster

@Suppress("NOTHING_TO_INLINE")
private inline fun TorRNModule.sendEvent(eventName: String, params: WritableMap) {
    try {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, params)
    } catch (e: Exception) {}
}

@Suppress("NOTHING_TO_INLINE")
private inline fun TorRNModule.sendEvent(eventName: String, string: String) {
    try {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, string)
    } catch (e: Exception) {}
}

/**
 * Events that emitted via the [RCTDeviceEventEmitter]:
 *
 *  - [TOR_PORT_CHANGE_EVENT]: See [SphinxTorEventBroadcaster.broadcastPortInformation]
 *  - [TOR_SERVICE_EXCEPTION_EVENT]
 *  - [TOR_SERVICE_LIFECYCLE_EVENT]: See [SphinxTorEventBroadcaster.broadcastServiceLifecycleEvent]
 *  - [TOR_STATE_CHANGE_EVENT]: See [SphinxTorEventBroadcaster.broadcastPortInformation]
 * */
class TorRNModule private constructor(
    val reactContext: ReactApplicationContext
): ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    companion object {
        @Volatile
        private var instance: TorRNModule? = null

        @JvmStatic
        fun getInstance(reactContext: ReactApplicationContext): TorRNModule =
            instance ?: synchronized(this) {
                instance ?: TorRNModule(reactContext)
                    .also { instance = it }
            }

        const val NAME = "TorRNModule"

        // TOR_PORT_CHANGE_EVENT Keys
        const val CONTROL_PORT_INFO = "CONTROL_PORT_INFO"
        const val DNS_PORT_INFO = "DNS_PORT_INFO"
        const val HTTP_PORT_INFO = "HTTP_PORT_INFO"
        const val SOCKS_PORT_INFO = "SOCKS_PORT_INFO"
        const val TRANS_PORT_INFO = "TRANS_PORT_INFO"

        // TOR_STATE_CHANGE_EVENT Keys
        const val TOR_STATE = "TOR_STATE"
        const val TOR_NETWORK_STATE = "TOR_NETWORK_STATE"

        // TOR_SERVICE_LIFECYCLE_EVENT Key
        const val TOR_SERVICE_LIFECYCLE = "TOR_SERVICE_LIFECYCLE"

        // RN Event Keys
        const val TOR_PORT_CHANGE_EVENT = "TOR_PORT_CHANGE_EVENT"
        const val TOR_SERVICE_EXCEPTION_EVENT = "TOR_SERVICE_EXCEPTION_EVENT"
        const val TOR_SERVICE_LIFECYCLE_EVENT = "TOR_SERVICE_LIFECYCLE_EVENT"
        const val TOR_STATE_CHANGE_EVENT = "TOR_STATE_CHANGE_EVENT"

        @Volatile
        private var portInfo: TorPortInfo = TorPortInfo(null, null, null, null, null)

        @Volatile
        private var torState: String = TorState.OFF
        @Volatile
        private var torNetworkState: String = TorNetworkState.DISABLED
    }

    //////////////////
    /// Controller ///
    //////////////////
    @ReactMethod
    fun newTorIdentity() {
        TorManager.getInstance(this).newIdentity()
    }

    @ReactMethod
    fun restartTor() {
        TorManager.getInstance(this).restartTor()
    }

    @ReactMethod
    fun startTor() {
        TorManager.getInstance(this).startTor()
    }

    @ReactMethod
    fun stopTor() {
        TorManager.getInstance(this).stopTor()
    }

    ///////////////////
    /// TorPortInfo ///
    ///////////////////
    @ReactMethod
    fun getControlPortAddress(promise: Promise) {
        promise.resolve(portInfo.controlPort)
    }

    @ReactMethod
    fun getDnsPortAddress(promise: Promise) {
        promise.resolve(portInfo.dnsPort)
    }

    @ReactMethod
    fun getHttpPortAddress(promise: Promise) {
        promise.resolve(portInfo.httpPort)
    }

    @ReactMethod
    fun getSocksPortAddress(promise: Promise) {
        promise.resolve(portInfo.socksPort)
    }

    @ReactMethod
    fun getTransPortAddress(promise: Promise) {
        promise.resolve(portInfo.transPort)
    }


    /////////////////
    /// Tor State ///
    /////////////////
    @ReactMethod
    fun getTorState(promise: Promise) {
        promise.resolve(torState)
    }

    @ReactMethod
    fun getTorNetworkState(promise: Promise) {
        promise.resolve(torNetworkState)
    }

    ////////////////////////
    /// EventBroadcaster ///
    ////////////////////////
    val eventBroadcaster: SphinxTorEventBroadcaster = TorServiceController.appEventBroadcaster?.let {
        it as SphinxTorEventBroadcaster
    } ?: SphinxTorEventBroadcaster()

    /**
     * See [io.matthewnelson.topl_core_base.EventBroadcaster]
     * See [io.matthewnelson.topl_service_base.TorServiceEventBroadcaster]
     * */
    inner class SphinxTorEventBroadcaster: TorServiceEventBroadcaster() {

        /**
         * See [ServiceLifecycleEvent] for literal string values that are emitted.
         * */
        override fun broadcastServiceLifecycleEvent(@ServiceLifecycleEvent event: String, hashCode: Int) {
            val params = Arguments.createMap()
            params.putString(TOR_SERVICE_LIFECYCLE, event)
            sendEvent(TOR_SERVICE_LIFECYCLE_EVENT, params)
        }

        override fun broadcastBandwidth(bytesRead: String, bytesWritten: String) {}

        override fun broadcastDebug(msg: String) {
            broadcastLogMessage(msg)
        }

        override fun broadcastException(msg: String?, e: Exception) {
            if (msg != null && msg.contains("|TorService|")) {
                sendEvent(TOR_SERVICE_EXCEPTION_EVENT, msg)
            }
            e.printStackTrace()
        }

        override fun broadcastLogMessage(logMessage: String?) {}

        override fun broadcastNotice(msg: String) {}

        override fun broadcastPortInformation(torPortInfo: TorPortInfo) {
            portInfo = torPortInfo
            val params = Arguments.createMap()
            params.putString(CONTROL_PORT_INFO, torPortInfo.controlPort)
            params.putString(DNS_PORT_INFO, torPortInfo.dnsPort)
            params.putString(HTTP_PORT_INFO, torPortInfo.httpPort)
            params.putString(SOCKS_PORT_INFO, torPortInfo.socksPort)
            params.putString(TRANS_PORT_INFO, torPortInfo.transPort)
            sendEvent(TOR_PORT_CHANGE_EVENT, params)
        }

        /**
         * See [TorState] and [TorNetworkState] for literal string values that are emitted.
         * */
        override fun broadcastTorState(@TorState state: String, @TorNetworkState networkState: String) {
            torState = state
            torNetworkState = networkState
            val params = Arguments.createMap()
            params.putString(TOR_STATE, state)
            params.putString(TOR_NETWORK_STATE, networkState)
            sendEvent(TOR_STATE_CHANGE_EVENT, params)
        }
    }
}
