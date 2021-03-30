package com.sphinx.tor

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import io.matthewnelson.topl_core_base.BaseConsts
import io.matthewnelson.topl_core_base.BaseConsts.TorNetworkState
import io.matthewnelson.topl_core_base.BaseConsts.TorState
import io.matthewnelson.topl_service_base.TorPortInfo
import io.matthewnelson.topl_service_base.TorServiceEventBroadcaster

class TorRNModule(val reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "TorRNModule"

        const val CONTROL_PORT_INFO = "CONTROL_PORT_INFO"
        const val DNS_PORT_INFO = "DNS_PORT_INFO"
        const val HTTP_PORT_INFO = "HTTP_PORT_INFO"
        const val SOCKS_PORT_INFO = "SOCKS_PORT_INFO"
        const val TRANS_PORT_INFO = "TRANS_PORT_INFO"

        const val TOR_SERVICE_EXCEPTION_EVENT = "TorServiceExceptionEvent"
        const val TOR_PORT_CHANGE_EVENT = "TorPortChangeEvent"

        const val TOR_STATE = "TOR_STATE"
        const val TOR_NETWORK_STATE = "TOR_NETWORK_STATE"

        const val TOR_STATE_CHANGE_EVENT = "TorStateChangeEvent"
    }

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
    @Volatile
    private var portInfo: TorPortInfo = TorPortInfo(null, null, null, null, null)

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
    @Volatile
    private var torState: String? = TorState.OFF

    @Volatile
    private var torNetworkState: String? = TorNetworkState.DISABLED

    @ReactMethod
    fun getTorState(promise: Promise) {
        promise.resolve(torState)
    }

    @ReactMethod
    fun getTorNetworkState(promise: Promise) {
        promise.resolve(torNetworkState)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @Suppress("SameParameterValue")
    private fun sendEvent(eventName: String, string: String?) {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(eventName, string)
    }

    ////////////////////////
    /// EventBroadcaster ///
    ////////////////////////
    val eventBroadcaster = SphinxTorEventBroadcaster()

    inner class SphinxTorEventBroadcaster: TorServiceEventBroadcaster() {
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

        override fun broadcastTorState(state: String, networkState: String) {
            torState = state
            torNetworkState = networkState
            val params = Arguments.createMap()
            params.putString(TOR_STATE, state)
            params.putString(TOR_NETWORK_STATE, networkState)
            sendEvent(TOR_STATE_CHANGE_EVENT, params)
        }
    }
}