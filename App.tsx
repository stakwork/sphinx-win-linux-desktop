import React, {useState, useEffect} from 'react'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import Main from './src/components/main'
import Onboard from './src/components/onboard'
import {useStores} from './src/store'
import {instantiateRelay} from './src/api'
import {useObserver} from 'mobx-react-lite'
import Loading from './src/components/loading'
import AsyncStorage from '@react-native-community/async-storage'

declare var global: {HermesInternal: null | {}}

export default function Wrap(){
  const {ui} = useStores()
  return useObserver(()=>{
    if (ui.ready) return <App /> // hydrated!
    return <Loading /> // full screen loading
  })
}

function App() {
  const {user} = useStores()
  const [loading, setLoading] = useState(true) // default
  const [signedUp, setSignedUp] = useState(false)

  useEffect(()=>{
    // AsyncStorage.clear()

    const isSignedUp = (user.currentIP && user.authToken)?true:false
    setSignedUp(isSignedUp)
    if(isSignedUp){
      instantiateRelay(user.currentIP, user.authToken)
    }
    setLoading(false)
  },[])

  if(loading) return <Loading />
  return (<PaperProvider theme={theme}>
    {signedUp && <Main />}
    {!signedUp && <Onboard onFinish={()=>setSignedUp(true)} />}
  </PaperProvider>)
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
