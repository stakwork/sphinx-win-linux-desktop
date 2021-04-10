import { NativeModule, NativeModules } from 'react-native'
const { TorRNModule: TorRNAndroid } = NativeModules

export interface TorPortInfo {
  controlAddress: string;
  dnsPort: string;
  httpAddress: string;
  socksAddress: string;
  transPort: string;
}

export enum TorNetworkState {
  DISABLED = "Network: disabled",
  ENABLED = "Network: enabled",
}

export enum TorDaemonState {
  OFF = "Tor: Off",
  ON = "Tor: On",
  STARTING = "Tor: Starting",
  STOPPING = "Tor: Stopping",
}

interface TorRNAndroidInterface extends NativeModule {
  newTorIdentity: () => string;
  restartTor: () => void;

  /**
   * Starts the Android Tor service, then starts up Tor.
   *
   * You can call this as much as you want. If
   * the Tor process is already running, it will do nothing.
   */
  startTor: () => void;

  /**
   * Stops the Android Tor service.
   */
  stopTor: () => void;

  getControlPortAddress: () => Promise<TorPortInfo["controlAddress"]>;
  getDnsPortAddress: () => Promise<TorPortInfo["dnsPort"]>;
  getHttpPortAddress: () => Promise<TorPortInfo["httpAddress"]>;
  getSocksPortAddress: () => Promise<TorPortInfo["socksAddress"]>;
  getTransPortAddress: () => Promise<TorPortInfo["transPort"]>;
  getTorState: () => Promise<TorDaemonState>;
  getTorNetworkState: () => Promise<TorNetworkState>;
}


export enum TorModuleEvent {
  PORT_CHANGE = 'TOR_PORT_CHANGE_EVENT',
  STATE_CHANGE = 'TOR_STATE_CHANGE_EVENT',
  SERVICE_LIFECYCLE = 'TOR_SERVICE_LIFECYCLE_EVENT',
  SERVICE_EXCEPTION = 'TOR_SERVICE_EXCEPTION_EVENT',
}

export enum TorModulePortChangeEventKey {
  CONTROL_PORT_INFO = "CONTROL_PORT_INFO",
  DNS_PORT_INFO = "DNS_PORT_INFO",
  HTTP_PORT_INFO = "HTTP_PORT_INFO",
  SOCKS_PORT_INFO = "SOCKS_PORT_INFO",
  TRANS_PORT_INFO = "TRANS_PORT_INFO",
}

export enum TorModuleStateChangeEventKey {
  TOR_STATE = "TOR_STATE",
  TOR_NETWORK_STATE = "TOR_NETWORK_STATE",
}

export enum TorModuleServiceLifecycleEventKey {
  TOR_SERVICE_LIFECYCLE = "TOR_SERVICE_LIFECYCLE",
}


export default TorRNAndroid as TorRNAndroidInterface
