import React, {useState, useEffect} from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import Main from './src/components/main'
import Onboard from './src/components/onboard'
import {useStores} from './src/store'
import {instantiateRelay} from './src/api'
import {useObserver} from 'mobx-react-lite'
import Loading from './src/components/loading'
import StatusBar from './src/components/utils/statusBar'
import * as utils from './src/components/utils/utils'
import {Linking} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import * as RNWebRTC from 'react-native-webrtc'
import {qrActions} from './src/qrActions'
// import AsyncStorage from '@react-native-community/async-storage'
import PINCode, {wasEnteredRecently} from './src/components/utils/pin'

declare var global: {HermesInternal: null | {}}

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
    RNWebRTC.registerGlobals()
  },[])

  return useObserver(()=>{
    if (ui.ready && wrapReady) return <App /> // hydrated and checked for deeplinks!
    return <Loading /> // full screen loading
  })
}

function App() {
  const {user,msg} = useStores()
  const [loading, setLoading] = useState(true) // default
  const [signedUp, setSignedUp] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(()=>{
    (async () => {
      const isSignedUp = (user.currentIP && user.authToken)?true:false
      setSignedUp(isSignedUp)
      if(isSignedUp){
        instantiateRelay(user.currentIP, user.authToken)
      }
      const pinWasEnteredRecently = await wasEnteredRecently()
      if(pinWasEnteredRecently) setPinned(true)

      setLoading(false)
    })()
  },[])

  if(loading) return <Loading />
  if(signedUp && !pinned) { // checking if the pin was entered recently
    return <PINCode
      onFinish={async() => {
        await sleep(240)
        setPinned(true)
      }}
    />
  }
  return (<>
    <NavigationContainer>
      <PaperProvider theme={theme}>
        {/* <StatusBar /> */}
        {signedUp && <Main />}
        {!signedUp && <Onboard onFinish={()=>{
          setSignedUp(true) // signed up w key export
          setPinned(true)   // also PIN has been set 
        }} />}
      </PaperProvider>
    </NavigationContainer>
  </>)
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6289FD',
    accent: '#55D1A9',
  },
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}