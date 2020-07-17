import React, {useEffect} from 'react'
import theme from './theme'
import ChatList from './chatList/chatList'
import Chat from './chat/chat'
import {useStores} from '../src/store'

export default function Main(){
  const {contacts,msg,details,user,meme,ui} = useStores()
  useEffect(()=>{
    (async () => {
      contacts.getContacts()
      msg.getMessages()
      details.getBalance()
      meme.authenticateAll()
      msg.initLastSeen()
    })()
  },[])
  return <main className="main" style={{background:theme.bg}}>
    <ChatList />
    <Chat />
  </main>
}