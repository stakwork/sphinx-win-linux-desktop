import React, {useState, useEffect} from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import Main from './src/components/main'
import Onboard from './src/components/onboard'
import {useStores, useTheme} from './src/store'
import {instantiateRelayAPI} from './src/api'
import {useObserver} from 'mobx-react-lite'
import Loading from './src/components/loading'
import StatusBar from './src/components/utils/statusBar'
import * as utils from './src/components/utils/utils'
import {Linking} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import {qrActions} from './src/qrActions'
import PINCode, {wasEnteredRecently} from './src/components/utils/pin'
import { useDarkMode } from 'react-native-dynamic'
import { is24HourFormat } from 'react-native-device-time-format'
import TrackPlayer from 'react-native-track-player';
import EE, {RESET_IP_FINISHED} from './src/components/utils/ee'
import { I18nManager } from 'react-native';


declare var global: {HermesInternal: null | {}}

try {
  I18nManager.allowRTL(false);
}
catch (e) {
  console.log(e);
}

export default function Wrap(){
  const {ui,chats} = useStores()
  const [wrapReady,setWrapReady] = useState(false)

  async function gotLink(e){
    if(e && typeof e==='string'){
      const j = utils.jsonFromUrl(e)
      if(j['action']) await qrActions(j,ui,chats)
    }
  }
  useEffect(()=>{
    // rsa.testSecure()
    // rsa.getPublicKey()

    console.log('=> check for deeplink')
    Linking.getInitialURL()
      .then(e=>{
        if(e) gotLink(e).then(()=> setWrapReady(true)) // start with initial url
        else setWrapReady(true) // cold start
      })
      .catch(()=> setWrapReady(true)) // this should not happen?
    Linking.addEventListener('url', gotLink)
    // RNWebRTC.registerGlobals()
  },[])

  return useObserver(()=>{
    if (ui.ready && wrapReady) return <App /> // hydrated and checked for deeplinks!
    return <Loading /> // full screen loading
  })
}

function App() {
  const { user, ui, torConnection } = useStores()
  const theme = useTheme()
  const isDarkMode = useDarkMode()

  const [loading, setLoading] = useState(true)

  const [isUserSignedUp, setIsUserSignedUp] = useState(
    user.currentIP &&
    user.authToken &&
    !user.onboardStep
  )

  const [pinned, setPinned] = useState(false)

  function connectedHandler() {
    ui.setConnected(true)
  }
  function disconnectedHandler() {
    ui.setConnected(false)
  }

  async function check24Hour(){
    const is24Hour = await is24HourFormat()
    ui.setIs24HourFormat(is24Hour)
  }

  function setupColorTheme() {
    if (theme.mode === 'System') {
      theme.setDark(isDarkMode);
    } else {
      theme.setDark(theme.mode === 'Dark');
    }
  }

  async function setupRelay() {
    if (isUserSignedUp) {
      instantiateRelayAPI({
        ip: user.currentIP,
        authToken: user.authToken,
        connectedCallback: connectedHandler,
        disconnectCallback: disconnectedHandler,
        resetIPCallback: resetIP,
        torConnectionStore: torConnection,
      })
    }

    const pinWasEnteredRecently = await wasEnteredRecently()

    if (pinWasEnteredRecently) setPinned(true)
  }

  async function resetIP(){
    ui.setLoadingHistory(true)
    const newIP = await user.resetIP()
    instantiateRelayAPI({
      ip: newIP,
      authToken: user.authToken,
      connectedCallback: connectedHandler,
      disconnectCallback: disconnectedHandler,
      torConnectionStore: torConnection,
    })
    EE.emit(RESET_IP_FINISHED)
  }

  useEffect(() => {
    setupColorTheme();
    check24Hour();
    TrackPlayer.setupPlayer();

    (async () => {
      await setupRelay()
      // user.currentIP = 'https://foo.onion'
      // user.currentIP = 'https://proxy.sphinx.chat'
      // user.currentIP = "";
      setLoading(false)
    })()
  }, [])


  return useObserver(()=>{
    if(loading) return <Loading />
    if(isUserSignedUp && !pinned) { // checking if the pin was entered recently
      return <PINCode
        onFinish={async() => {
          await sleep(240)
          setPinned(true)
        }}
      />
    }

    const paperTheme = {
      ...DefaultTheme,
      roundness: 2,
      colors: {
        ...DefaultTheme.colors,
        primary: '#6289FD',
        accent: '#55D1A9',
        text:theme.title,
        placeholder:theme.subtitle,
        background:theme.bg,
        surface:theme.main
      },
      dark:theme.dark
    }

    return (<>
      <NavigationContainer>
        <PaperProvider theme={paperTheme}>
          {/* <StatusBar /> */}
          {isUserSignedUp && <Main />}
          {!isUserSignedUp && <Onboard onFinish={()=>{
            user.finishOnboard() // clear out things
            setIsUserSignedUp(true) // signed up w key export
            setPinned(true)   // also PIN has been set
          }} />}
        </PaperProvider>
      </NavigationContainer>
    </>)
  })
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
