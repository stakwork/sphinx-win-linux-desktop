import React from 'react'
import * as store from '../src/store'
import './style.css'
import ChatList from './chat/chatList'
import Chat from './chat/chat'
import theme from './theme'

console.log(store)

function App(){
  return <main className="main" style={{background:theme.bg}}>
    <ChatList />
    <Chat />
  </main>
}

export default App
