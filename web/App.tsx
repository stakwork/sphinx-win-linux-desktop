import React from 'react'
import {useStores} from '../src/store'
import './style.css'
import ChatList from './chat/chatList'
import Chat from './chat/chat'
import theme from './theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useObserver} from 'mobx-react-lite'
import styled from 'styled-components'

function Wrap(){
  const {ui,chats} = useStores()
  return useObserver(()=>{
    if(ui.ready) return <App />
    return <Loading />
  })
}

function App(){
  return <main className="main" style={{background:theme.bg}}>
    <ChatList />
    <Chat />
  </main>
}

const Loading=styled.div`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(145deg, rgb(0, 100, 109) 42%, rgb(65, 28, 206)) 0% 0% / cover; 
`

export default App
