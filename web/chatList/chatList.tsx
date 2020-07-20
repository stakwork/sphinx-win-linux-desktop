import React, {useState} from 'react'
import styled from 'styled-components'
import Dragger from './dragger'
import {useObserver} from 'mobx-react-lite'
import Head from './head'
import ChatRow from './chatRow'
import {useStores,hooks} from '../../src/store'
const {useChats} = hooks

function ChatList(){
  const {msg,ui} = useStores()
  const maxWidth = 350
  const [width,setWidth] = useState(maxWidth)
  return useObserver(()=>{
    const theChats = useChats()
    const scid = ui.selectedChat&&ui.selectedChat.id
    return <Section style={{width,maxWidth:width,minWidth:width}}>
      <Inner>
        <Head />
        <Chats>
          {theChats.map((c,i)=> (<ChatRow 
            key={i} {...c} 
            selected={c.id===scid} 
            onClick={()=> {
              msg.seeChat(c.id)
              ui.setSelectedChat(c)
            }} />)
          )}
        </Chats>
      </Inner>
      <Dragger setWidth={setWidth} maxWidth={maxWidth} />
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
  width:99.4%;
  position:relative;
  z-index:9;
  margin-top:4px;
`

export default ChatList