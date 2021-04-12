
import { action, reaction, computed, observable } from 'mobx'
import { NativeEventEmitter } from 'react-native';
import { EmitterSubscription } from 'react-native-track-player';
import UserStore, { userStore as defaultUserStore } from './user'
import KotlinTorService, { TorDaemonState, TorModuleEvent, TorModulePortChangeEventKey, TorModuleStateChangeEventKey, TorNetworkState, TorPortInfo } from '../native-module-wrappers/KotlinTorService'
import KotlinTorHTTP from '../native-module-wrappers/KotlinTorHTTP';
import { startTorHTTPClientIfNotStarted } from '../api/tor-request-utils';
import { persist } from 'mobx-persist';

export default class TorConnectionStore {
  userStore: UserStore;
  torModuleEventListeners: EmitterSubscription[];

  torModuleEventHandlingMap: Record<TorModuleEvent, Function>;

  @persist @observable
  torPortInfo: TorPortInfo = {
    controlAddress: '',
    dnsPort: '',
    httpAddress: '',
    socksAddress: '',
    transPort: '',
  };

  @persist @observable
  isTorClientBuilt: boolean = false;


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
      () => this.torPortInfo.socksAddress,
      () => this.handleTorSocksAddressChange(),
    );

    this.setupListeners()
  }

  @computed
  public get isTorServiceActive(): boolean {
    return Boolean(this.torPortInfo.socksAddress)
  }


  public async getTorDaemonState(): Promise<TorDaemonState> {
    return await KotlinTorService.getTorState()
  }

  public async getTorNetworkState(): Promise<TorNetworkState> {
    return await KotlinTorService.getTorNetworkState()
  }

  public async activateTorConnection() {
    await KotlinTorService.startTor()
    await startTorHTTPClientIfNotStarted(this.torPortInfo.socksAddress)
  }


  @action
  async handleUserIPChange() {
    console.log(`handleUserIPChange`)
    console.log(`new IP: ${this.userStore.currentIP}`)

    const daemonState = await this.getTorDaemonState()

    if (this.userStore.isIPAnOnionRoute == false) {
      if (daemonState == TorDaemonState.ON) {
        await KotlinTorService.stopTor();
        await KotlinTorHTTP.clearClient()
      }
    } else {
      if (daemonState == TorDaemonState.OFF) {
        await KotlinTorService.startTor()
      } else if (daemonState == TorDaemonState.ON) {
        await startTorHTTPClientIfNotStarted(this.torPortInfo.socksAddress)
        this.isTorClientBuilt = true
      }
    }
  }

  @action
  async handleTorSocksAddressChange() {
    console.log('Reacting to torPortInfo Socks address change', this.torPortInfo.socksAddress);

    const daemonState = await this.getTorDaemonState()
    const networkState = await this.getTorNetworkState()

    if (daemonState == TorDaemonState.ON && networkState == TorNetworkState.ENABLED) {
      if (this.isTorClientBuilt) {
        await KotlinTorHTTP.clearClient()
      }

      await KotlinTorHTTP.buildClient(this.torPortInfo.socksAddress)
    }
  }

  @action
  handleTorPortChangeEvent(payload: Record<TorModulePortChangeEventKey, string>) {
    console.log(`handleTorPortChangeEvent`)
    console.log(payload);

    this.torPortInfo.controlAddress = payload.CONTROL_PORT_INFO;
    this.torPortInfo.dnsPort = payload.DNS_PORT_INFO;
    this.torPortInfo.httpAddress = payload.HTTP_PORT_INFO;
    this.torPortInfo.socksAddress = payload.SOCKS_PORT_INFO;
    this.torPortInfo.transPort = payload.TRANS_PORT_INFO;
  }


  @action
  async handleTorStateChangeEvent(payload: Record<TorModuleStateChangeEventKey, string>) {
    console.log("handleTorStateChangeEvent");

    const daemonState = payload[TorModuleStateChangeEventKey.TOR_STATE]
    const networkState = payload[TorModuleStateChangeEventKey.TOR_NETWORK_STATE]

    console.log(daemonState);
    console.log(networkState);
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
    const eventEmitter = new NativeEventEmitter(KotlinTorService);

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

export const torConnectionStore = new TorConnectionStore(defaultUserStore)
