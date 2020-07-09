import React, {useState, useEffect} from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import Main from './src/components/main'
import Onboard from './src/components/onboard'
import {useStores} from './src/store'
import {instantiateRelay} from './src/api'
import {useObserver} from 'mobx-react-lite'
import Loading from './src/components/loading'
import AsyncStorage from '@react-native-community/async-storage'
import StatusBar from './src/components/utils/statusBar'
import * as utils from './src/components/utils/utils'
import {Linking} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import * as RNWebRTC from 'react-native-webrtc'
import {qrActions} from './src/qrActions'
// import * as rsa from './src/crypto/rsa'

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

  useEffect(()=>{
    // AsyncStorage.clear()
    // msg.clearAllMessages()
    const isSignedUp = (user.currentIP && user.authToken)?true:false
    setSignedUp(isSignedUp)
    if(isSignedUp){
      instantiateRelay(user.currentIP, user.authToken)
    }
    setLoading(false)
  },[])

  if(loading) return <Loading />
  return (<>
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <StatusBar />
        {signedUp && <Main />}
        {!signedUp && <Onboard onFinish={()=>setSignedUp(true)} />}
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
