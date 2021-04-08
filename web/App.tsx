import React, {useState,useEffect} from 'react'
import {useStores} from '../src/store'
import './style.css'
import onreset from './utils/onreset'
import 'video-react/dist/video-react.css';
import theme from './theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useObserver} from 'mobx-react-lite'
import styled from 'styled-components'
import PIN, {wasEnteredRecently, userPinCode} from './modals/pin'
import Onboard from './onboard'
import {instantiateRelayAPI} from '../src/api'
import ChatList from './chatList/chatList'
import Chat from './chat/chat'
import * as localForage from 'localforage'
import Modals from './modals'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { PaletteType } from '@material-ui/core';
import 'react-h5-audio-player/lib/styles.css';
import EE, {RESET_IP, RESET_IP_FINISHED} from './utils/ee'
import setupDeepLink from './utils/deeplink'
import {check} from './version'

const palette = {
  type: 'dark' as PaletteType,
  primary: {
    main: theme.primary
  },
  secondary: {
    main: theme.secondary
  },
  action: {
    disabledBackground: theme.disabledPrimary,
  }
}

function Wrap(){
  const {ui} = useStores()
  return useObserver(()=>{
    if(ui.ready) return <ThemeProvider theme={ createMuiTheme({palette}) }><App /></ThemeProvider>
    return <Loading>
      <CircularProgress style={{color:'white'}} />
    </Loading>
  })
}

function App(){
  const {user,ui,torConnection} = useStores()
  const [pinned,setPinned] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [welcome, setWelcome] = useState(false)

  useEffect(()=>{
    setupDeepLink()
    onreset(function(){
      setSignedUp(false)
    })
  }, [])

  useEffect(()=>{
    (async () => {
      const isSignedUp = (user.currentIP && user.authToken)?true:false
      setSignedUp(isSignedUp)

      if (isSignedUp) {
        instantiateRelayAPI({
          ip: user.currentIP,
          authToken: user.authToken,
          connectedCallback: function() {
            ui.setConnected(true)
          },
          disconnectCallback: function() {
            ui.setConnected(false)
          },
          resetIPCallback: ()=> resetIP(),
          torConnectionStore: torConnection,
        })
      }

      const pinWasEnteredRecently = await wasEnteredRecently()
      if(pinWasEnteredRecently) setPinned(true)
      setWelcome(true)
    })()
  },[])

  async function resetIP(){
    EE.emit(RESET_IP)
    const newIP = await user.resetIP()
    instantiateRelayAPI({
      ip: newIP,
      authToken: user.authToken,
      connectedCallback: function(){
        ui.setConnected(true)
      },
      disconnectCallback: function(){
        ui.setConnected(false)
      },
      torConnectionStore: torConnection,
    })
    EE.emit(RESET_IP_FINISHED)
  }

  if(!signedUp) {
    return <Onboard welcome={welcome} onRestore={async()=>{
      await sleep(240)
      setSignedUp(true)
      const isPin = await userPinCode()
      if(isPin) setPinned(true)
    }}/>
  }
  if(!pinned) {
    return <main className="main" style={{background:theme.bg}}>
      {!pinned && <PIN onFinish={()=>setPinned(true)} />}
    </main>
  }
  return <Main />
}

function Main(){
  const {details,msg,ui,meme,auth} = useStores()

  useEffect(()=>{
    setTimeout(()=>{
      meme.authenticateAll()
      meme.checkCacheEnabled()
    }, 1500)
    msg.initLastSeen()
    checkVersion()
    details.getRelayVersion().then(v=>console.log("VERSION",v))
  },[])

  async function checkVersion(){
    const show = await check()
    console.log("SHOW VERSION DIALOG",show)
    if(show) ui.setShowVersionDialog(true)
  }

  return <main className="main" style={{background:theme.bg}}>
    <ChatList />
    <Chat />
    <Modals />
  </main>
}

const Loading=styled.div`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(145deg, #A68CFF 0%, #6A8FFF) 0% 0% / cover;
`

export default Wrap

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

