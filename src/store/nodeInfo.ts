
import { observable, action, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { NativeEventEmitter, NativeModules } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore from './user'
const { TorRNModule } = NativeModules


// interface Node {
//   host?: string;
//   port?: string;
//   urlPath?: string;
//   isTorEnabled?: boolean;
// }


export default class NodeInfoStore {
  userStore: UserStore;
  torStateListener: EmitterSubscription;


  constructor(userStore: UserStore) {
    this.userStore = userStore;

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


  setupListeners = () => {
    const eventEmitter = new NativeEventEmitter(TorRNModule);

    this.torStateListener = eventEmitter.addListener(
      'TOR_SERVICE_LIFECYCLE_EVENT',
      (event) => {
        console.log(event.eventProperty) // "someValue"
      }
    );
  }

  tearDownListeners = () => {
    this.torStateListener.remove()
  }
}
