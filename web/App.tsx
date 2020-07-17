import React, {useState,useEffect} from 'react'
import {useStores} from '../src/store'
import './style.css'
import ChatList from './chat/chatList'
import Chat from './chat/chat'
import theme from './theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useObserver} from 'mobx-react-lite'
import styled from 'styled-components'
import PIN, {wasEnteredRecently} from './modals/pin'
import Onboard from './onboard'

function Wrap(){
  const {ui,chats} = useStores()
  return useObserver(()=>{
    if(ui.ready) return <App />
    return <Loading>
      <CircularProgress style={{color:'white'}} />
    </Loading>
  })
}

function App(){
  const [pinned,setPinned] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  useEffect(()=>{
    (async () => {
      const pinWasEnteredRecently = await wasEnteredRecently()
      if(pinWasEnteredRecently) setPinned(true)
    })()
  },[])
  if(!signedUp) {
    return <Onboard />
  }
  return <main className="main" style={{background:theme.bg}}>
    {!pinned && <PIN onFinish={()=>setPinned(true)} />}
    <ChatList />
    <Chat />
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
