import React, {useState,useEffect} from 'react'
import {useStores} from '../src/store'
import './style.css'
import 'video-react/dist/video-react.css';
import theme from './theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useObserver} from 'mobx-react-lite'
import styled from 'styled-components'
import PIN, {wasEnteredRecently} from './modals/pin'
import Onboard from './onboard'
import {instantiateRelay} from '../src/api'
import ChatList from './chatList/chatList'
import Chat from './chat/chat'
import * as localForage from 'localforage'
import Modals from './modals'

function Wrap(){
  const {ui} = useStores()
  return useObserver(()=>{
    if(ui.ready) return <App />
    return <Loading>
      <CircularProgress style={{color:'white'}} />
    </Loading>
  })
}

function App(){
  const {user} = useStores()
  const [pinned,setPinned] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [welcome, setWelcome] = useState(false)
  useEffect(()=>{
    (async () => {
      const isSignedUp = (user.currentIP && user.authToken)?true:false
      setSignedUp(isSignedUp)
      if(isSignedUp){
        instantiateRelay(user.currentIP, user.authToken)
      }
      const pinWasEnteredRecently = await wasEnteredRecently()
      if(pinWasEnteredRecently) setPinned(true)
      setWelcome(true)

      // setTimeout(()=>{
      //   localForage.clear()
      //   console.log('localForage.clear()')
      // },1000)
    })()
  },[])
  if(!signedUp) {
    return <Onboard welcome={welcome} onRestore={async()=>{
      await sleep(240)
      setSignedUp(true)
      setPinned(true)
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
  const {contacts,msg,details,meme} = useStores()
  useEffect(()=>{
    contacts.getContacts().then(()=>{
      meme.authenticateAll()
      meme.checkCacheEnabled()
    })
    details.getBalance()
    msg.getMessages()
    msg.initLastSeen()
  },[])
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