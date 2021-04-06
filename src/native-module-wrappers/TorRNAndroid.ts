import { NativeModule, NativeModules } from 'react-native'
const { TorRNModule: TorRNAndroid } = NativeModules

interface TorPortInfo {
  controlPort: string;
  dnsPort: string;
  httpPort: string;
  socksPort: string;
  transPort: string;
}

interface TorRNAndroidInterface extends NativeModule {
  newTorIdentity: () => string;
  restartTor: () => void;
  startTor: () => void;
  stopTor: () => void;

  getControlPortAddress: () => Promise<TorPortInfo["controlPort"]>;
  getDnsPortAddress: () => Promise<TorPortInfo["dnsPort"]>;
  getHttpPortAddress: () => Promise<TorPortInfo["httpPort"]>;
  getSocksPortAddress: () => Promise<TorPortInfo["socksPort"]>;
  getTransPortAddress: () => Promise<TorPortInfo["transPort"]>;
  getTorState: () => Promise<string>;
  getTorNetworkState: () => Promise<string>;
}


export enum TorModuleEvent {
  PORT_CHANGE = 'TOR_PORT_CHANGE_EVENT',
  STATE_CHANGE = 'TOR_STATE_CHANGE_EVENT',
  SERVICE_LIFECYCLE = 'TOR_SERVICE_LIFECYCLE_EVENT',
  SERVICE_EXCEPTION = 'TOR_SERVICE_EXCEPTION_EVENT',
}

export enum TorModulePortChangeEvent {
  CONTROL_PORT_INFO = "CONTROL_PORT_INFO",
  DNS_PORT_INFO = "DNS_PORT_INFO",
  HTTP_PORT_INFO = "HTTP_PORT_INFO",
  SOCKS_PORT_INFO = "SOCKS_PORT_INFO",
  TRANS_PORT_INFO = "TRANS_PORT_INFO",
}

export enum TorModuleStateChangeEvent {
  TOR_STATE = "TOR_STATE",
  TOR_NETWORK_STATE = "TOR_NETWORK_STATE",
}



export default TorRNAndroid as TorRNAndroidInterface
