package com.sphinx.tor

import android.content.Context
import io.matthewnelson.topl_service_base.ServiceExecutionHooks

/**
 * See [ServiceExecutionHooks]
 * */
class SphinxTorServiceExecutionHooks: ServiceExecutionHooks() {
    override suspend fun executeOnCreateTorService(context: Context) {}

    override suspend fun executeBeforeStartTor(context: Context) {}

    override suspend fun executeAfterStopTor(context: Context) {}

    override suspend fun executeBeforeStoppingService(context: Context) {}

    override suspend fun executeOnStartCommandBeforeStartTor(context: Context) {}
}