
import { action, reaction, computed, observable } from 'mobx'
import { NativeEventEmitter } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore from './user'
import TorRNAndroid, { TorModuleEvent, TorModulePortChangeEventKey, TorPortInfo } from '../native-module-wrappers/TorRNAndroid'
import KotlinTorHTTP from '../native-module-wrappers/KotlinTorHTTP';
import { startTorHTTPClientIfNotStarted } from '../api/tor-request-utils';


export default class TorConnectionStore {
  userStore: UserStore;
  torModuleEventListeners: EmitterSubscription[];

  torModuleEventHandlingMap: Record<TorModuleEvent, Function>;

  @observable
  torPortInfo: TorPortInfo = {
    controlAddress: '',
    dnsPort: '',
    httpAddress: '',
    socksAddress: '',
    transPort: '',
  };


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
      () => this.handleUserIPChange()
    );

    reaction(
      () => this.torPortInfo,
      () => this.handlePortInfoChange(),
    );

    this.setupListeners()
  }

  @computed
  public get userHasOnionServerURL(): boolean {
    return this.userStore.currentIP.includes('.onion')
  }

  @computed
  public get isTorServiceActive(): boolean {
    return this.torPortInfo.socksAddress?.length != 0
  }

  @action
  async handleUserIPChange() {
    console.log(`handleUserIPChange`)
    console.log(`new IP: ${this.userStore.currentIP}`)

    if (this.userHasOnionServerURL == false && this.isTorServiceActive) {
      await TorRNAndroid.stopTor();
      await KotlinTorHTTP.clearClient()

      return
    }

    if (this.isTorServiceActive) {
      await startTorHTTPClientIfNotStarted(this.torPortInfo.socksAddress)
    } else {
      await TorRNAndroid.startTor()
    }
  }

  @action
  async handlePortInfoChange() {
    console.log('Reacting to torPortInfo Change');
    if (this.isTorServiceActive) {
      await KotlinTorHTTP.clearClient()
      await KotlinTorHTTP.buildClient(this.torPortInfo.socksAddress)
    }
  }

  @action
  async handleTorPortChangeEvent(payload: Record<TorModulePortChangeEventKey, string>) {
    console.log(`handleTorPortChangeEvent`)
    console.log(payload);

    this.torPortInfo.controlAddress = payload.CONTROL_PORT_INFO || '';
    this.torPortInfo.dnsPort = payload.DNS_PORT_INFO || '';
    this.torPortInfo.httpAddress = payload.HTTP_PORT_INFO || '';
    this.torPortInfo.socksAddress = payload.SOCKS_PORT_INFO || '';
    this.torPortInfo.transPort = payload.TRANS_PORT_INFO || '';

    // TODO: Call this here instead of in the `reaction` method?
    // if (this.isTorServiceActive) {
    //   await KotlinTorHTTP.buildClient(this.torPortInfo.socksAddress)
    // }
  }

  @action
  handleTorStateChangeEvent(event) {
    console.log("handleTorStateChangeEvent");
    console.log(event);
  }

  @action
  handleTorServiceLifecycleEvent(event) {
    console.log("handleTorServiceLifecycleEvent");
    console.log(event);
  }

  @action
  handleTorServiceLifecycleException(event) {
    console.log("handleTorServiceLifecycleException");
    console.log(event);
  }


  setupListeners = () => {
    const eventEmitter = new NativeEventEmitter(TorRNAndroid);

    Object.keys(this.torModuleEventHandlingMap).forEach(eventName => {
      this.torModuleEventListeners.push(
        eventEmitter.addListener(
          eventName,
          this.torModuleEventHandlingMap[eventName].bind(this)
      ));
    })
  }

  tearDownListeners = () => {
    this.torModuleEventListeners.forEach(listener => listener.remove())
  }
}
