
import { observable, action, reaction, computed, autorun } from 'mobx'
import { persist } from 'mobx-persist'
import { NativeEventEmitter } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore from './user'
import TorRNAndroid, { TorModuleEvent, TorPortInfo } from '../native-module-wrappers/TorRNAndroid'


export default class TorConnectionStore {
  userStore: UserStore;
  torModuleEventListeners: EmitterSubscription[];

  torModuleEventHandlingMap: Record<TorModuleEvent, Function>;
  torPortInfo: TorPortInfo

  constructor(userStore: UserStore) {
    this.userStore = userStore;
    this.torModuleEventListeners = [];

    this.torModuleEventHandlingMap = {
      [TorModuleEvent.PORT_CHANGE]: this.handleTorPortChangeEvent,
      [TorModuleEvent.STATE_CHANGE]: this.handleTorStateChangeEvent,
      [TorModuleEvent.SERVICE_LIFECYCLE]: this.handleTorServiceLifecycleEvent,
      [TorModuleEvent.SERVICE_EXCEPTION]: this.handleTorServiceLifecycleException,
    }

    reaction(
      () => this.userStore.currentIP,
      () => this.handleTorIPChange()
    );

    this.handleTorIPChange()
    this.setupListeners()
  }


  @computed
  public get isTorEnabled(): boolean {
    return this.userStore.currentIP.includes('.onion')
  }


  @action async handleTorIPChange() {
    console.log(`handleTorIPChange`)

    if (this.isTorEnabled) {
      // TODO: Be smarter about starting vs restarting here
      await TorRNAndroid.startTor()
    } else {
      await TorRNAndroid.stopTor()
    }
  }

  @action handleTorPortChangeEvent(event) {
    console.log(`handleTorPortChangeEvent`)
    console.log(event);
  }

  @action handleTorStateChangeEvent(event) {
    console.log("handleTorStateChangeEvent");
    console.log(event);
  }

  @action handleTorServiceLifecycleEvent(event) {
    console.log("handleTorServiceLifecycleEvent");
    console.log(event);
  }

  @action handleTorServiceLifecycleException(event) {
    console.log("handleTorServiceLifecycleException");
    console.log(event);
  }


  setupListeners = () => {
    const eventEmitter = new NativeEventEmitter(TorRNAndroid);

    Object.keys(this.torModuleEventHandlingMap).forEach(eventName => {
      this.torModuleEventListeners.push(
        eventEmitter.addListener(
          eventName,
          this.torModuleEventHandlingMap[eventName]
      ));
    })
  }

  tearDownListeners = () => {
    this.torModuleEventListeners.forEach(listener => listener.remove())
  }
}
