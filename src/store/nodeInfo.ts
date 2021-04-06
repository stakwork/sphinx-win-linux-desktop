
import { observable, action, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { NativeEventEmitter } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore from './user'
import TorRNAndroid, { TorModuleEvent } from '../native-module-wrappers/TorRNAndroid'


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
      await TorRNAndroid.startTor()
    } else {
      await TorRNAndroid.stopTor()
    }
  }

  @action handleTorStateChange() {
  }


  @action handleTorModuleEvent(event) {
    console.log(`Handling Tor Module Event`)
  }


  setupListeners = () => {
    const eventEmitter = new NativeEventEmitter(TorRNAndroid);

    Object.values(TorModuleEvent).forEach(eventName => {
      this.torStateListeners.push(eventEmitter.addListener(
        eventName,
        // this.handleTorModuleEvent
        (event) => {
          console.log(`Tor Module Event (${eventName})...`);
          console.log(event);
          this.handleTorModuleEvent(event)
        }
      ));
    })
  }

  tearDownListeners = () => {
    this.torStateListeners.forEach(listener => listener.remove())
  }
}
