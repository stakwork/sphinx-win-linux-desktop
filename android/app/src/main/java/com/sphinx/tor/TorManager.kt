package com.sphinx.tor

import android.app.Application
import android.app.PendingIntent
import androidx.core.app.NotificationCompat
import com.sphinx.BuildConfig
import com.sphinx.R
import io.matthewnelson.topl_service.TorServiceController
import io.matthewnelson.topl_service.lifecycle.BackgroundManager
import io.matthewnelson.topl_service.notification.ServiceNotification

private inline val TorManager.generateServiceNotificationBuilder: ServiceNotification.Builder
    get() = ServiceNotification.Builder(
            channelName = "Sphinx Tor",
            channelID = "TorService",
            channelDescription = "TorOnionProxyLibrary-Android",
            notificationID = 615
        )
            // customize the images later with your own
            .setImageTorNetworkingEnabled(R.drawable.tor_stat_network_enabled)
            .setImageTorNetworkingDisabled(R.drawable.tor_stat_network_disabled)
            .setImageTorDataTransfer(R.drawable.tor_stat_network_dataxfer)
            .setImageTorErrors(R.drawable.tor_stat_notifyerr)

            // choose a color that you like more
//                .setCustomColor(R.color.tor_purple)

            // lock screen visibility
            .setVisibility(NotificationCompat.VISIBILITY_SECRET)

            // notification buttons (New ID is always present)
            .enableTorRestartButton(false)
            .enableTorStopButton(false)

            // enable/disable showing of notification
            .showNotification(true)

private inline val TorManager.generateBackgroundManagerPolicy: BackgroundManager.Builder.Policy
    get() = BackgroundManager.Builder().runServiceInForeground(true)

@Suppress("NOTHING_TO_INLINE")
inline fun TorManager.newIdentity() {
    TorServiceController.newIdentity()
}

@Suppress("NOTHING_TO_INLINE")
inline fun TorManager.restartTor() {
    TorServiceController.restartTor()
}

@Suppress("NOTHING_TO_INLINE")
inline fun TorManager.startTor() {
    TorServiceController.startTor()
}

@Suppress("NOTHING_TO_INLINE")
inline fun TorManager.stopTor() {
    TorServiceController.stopTor()
}

/**
 * Used to ensure initialization of the [TorServiceController.Builder]
 * */
class TorManager private constructor(
        application: Application,
        broadcaster: TorRNModule.SphinxTorEventBroadcaster
) {

    companion object {
        @Volatile
        private var instance: TorManager? = null

        @JvmStatic
        fun getInstance(module: TorRNModule): TorManager =
            instance ?: synchronized(this) {
                instance ?: TorManager(
                    module.reactContext.applicationContext as Application,
                    module.eventBroadcaster
                )
                    .also { instance = it }
            }
    }

    init {
        TorServiceController.Builder(
            application = application,
            torServiceNotificationBuilder = generateServiceNotificationBuilder
//                .also { builder ->
//                    application.applicationContext.packageManager
//                        ?.getLaunchIntentForPackage(application.applicationContext.packageName)
//                        ?.let { intent ->
//                            builder.setContentIntent(
//                                    PendingIntent.getActivity(application.applicationContext, 0, intent, 0)
//                            )
//                        }
//                }
            ,
            backgroundManagerPolicy = generateBackgroundManagerPolicy,
            buildConfigVersionCode = BuildConfig.VERSION_CODE,
            defaultTorSettings = SphinxTorSettings(),
            geoipAssetPath = "common/geoip",
            geoip6AssetPath = "common/geoip6"
        )
            // Adjust time as desired. See each method's documentation for more info.
            .addTimeToDisableNetworkDelay(1_000L)
            .addTimeToRestartTorDelay(100L)
            .addTimeToStopServiceDelay(100L)

            // When user swipes the App from recent app's tray, the Service
            // automatically stops itself after properly shutting down Tor.
            // If setting this option to true, the BackgroundManager policy
            // must be changed or exceptions are thrown to enforce proper
            // operation of the Library.
            .disableStopServiceOnTaskRemoved(false)

            .setBuildConfigDebug(BuildConfig.DEBUG)

            // is available from TorServiceController.Companion.appEventBroadcaster
            // just cast it as TorEventBroadcaster
            .setEventBroadcaster(broadcaster)

            // ServiceExecutionHooks allow for synchronous code execution at key events
            // in TorService's operation.
            .setServiceExecutionHooks(SphinxTorServiceExecutionHooks())

            .build()
    }
}