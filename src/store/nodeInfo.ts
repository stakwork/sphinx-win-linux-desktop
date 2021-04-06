
import { observable, action, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { NativeEventEmitter, NativeModules } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore from './user'
const { TorRNModule } = NativeModules



enum TorModuleEvent {
  PORT_CHANGE = 'TOR_PORT_CHANGE_EVENT',
  STATE_CHANGE = 'TOR_STATE_CHANGE_EVENT',
  SERVICE_LIFECYCLE = 'TOR_SERVICE_LIFECYCLE_EVENT',
  SERVICE_EXCEPTION = 'TOR_SERVICE_EXCEPTION_EVENT',
}

enum TorModulePortChangeEvent {
  CONTROL_PORT_INFO = "CONTROL_PORT_INFO",
  DNS_PORT_INFO = "DNS_PORT_INFO",
  HTTP_PORT_INFO = "HTTP_PORT_INFO",
  SOCKS_PORT_INFO = "SOCKS_PORT_INFO",
  TRANS_PORT_INFO = "TRANS_PORT_INFO",
}

enum TorModuleStateChangeEvent {
  TOR_STATE = "TOR_STATE",
  TOR_NETWORK_STATE = "TOR_NETWORK_STATE",
}


export default class NodeInfoStore {
  userStore: UserStore;
  torStateListeners: EmitterSubscription[];


  constructor(userStore: UserStore) {
    this.userStore = userStore;
    this.torStateListeners = [];

    reaction(
      () => this.userStore.isTorEnabled,
      () => this.handleTorSettingsChange()
    );

    this.handleTorSettingsChange()
    this.setupListeners()
  }


  @action async handleTorSettingsChange() {
    if (this.userStore.isTorEnabled) {
      // TODO: Be smarter about starting vs restarting here
      await TorRNModule.startTor()
    } else {
      await TorRNModule.stopTor()
    }
  }

  @action handleTorStateChange() {
  }


  @action handleTorModuleEvent(event) {
    console.log(`Handling Tor Module Event`)
  }


  setupListeners = () => {
    const eventEmitter = new NativeEventEmitter(TorRNModule);

    Object.values(TorModuleEvent).forEach(eventName => {
      this.torStateListeners.push(eventEmitter.addListener(
        eventName,
        // this.handleTorModuleEvent
        (event) => {
          console.log(`Tor Module Event (${eventName}): ${event}`);
          this.handleTorModuleEvent(event)
        }
      ));
    })
  }

  tearDownListeners = () => {
    this.torStateListeners.forEach(listener => listener.remove())
  }
}
