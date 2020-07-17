import React, {useState} from 'react'
import styled from 'styled-components'
import Dragger from './dragger'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import {allChats, sortChats, filterChats} from '../../src/components/chat/utils'
import Head from './head'
import ChatRow from './chatRow'

function ChatList(){
  const {ui,chats,contacts,msg,details} = useStores()
  const [width,setWidth] = useState(400)
  return useObserver(()=>{
    const theChats = allChats(chats.chats, contacts.contacts)
    const chatsToShow = filterChats(theChats, ui.searchTerm)
    sortChats(chatsToShow, msg.messages)
    return <Section style={{width,maxWidth:width,minWidth:width}}>
      <Inner>
        <Head />
        <Chats>
          {chatsToShow.map((c,i)=>{
            return <ChatRow key={i} {...c} />
          })}
        </Chats>
      </Inner>
      <Dragger setWidth={setWidth}/>
    </Section>
  })
}

const Section=styled.section`
  height:100%;
  display:flex;
  flex:1;
`
const Inner=styled.div`
  display:flex;
  flex:1;
  flex-direction:column;
  width:calc(100% - 11px);
  min-width:calc(100% - 11px);
  max-width:calc(100% - 11px);
`
const Chats = styled.div`
  display:flex;
  flex:1;
  overflow:auto;
  flex-direction:column;
  width:100%;
`

export default ChatList