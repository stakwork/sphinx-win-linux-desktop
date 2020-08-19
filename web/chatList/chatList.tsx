import React, {useState} from 'react'
import styled from 'styled-components'
import Dragger from './dragger'
import {useObserver} from 'mobx-react-lite'
import Head from './head'
import ChatRow from './chatRow'
import {Chat} from '../../src/store/chats'
import {Contact} from '../../src/store/contacts'
import {constants} from '../../src/constants'
import {useStores,hooks} from '../../src/store'
const {useChats} = hooks

function ChatList(){
  const {msg,ui,contacts,chats} = useStores()
  const maxWidth = 350
  const [width,setWidth] = useState(maxWidth)
  return useObserver(()=>{
    const theChats = useChats()
    const scid = ui.selectedChat&&ui.selectedChat.id
    const scname = ui.selectedChat&&ui.selectedChat.name
    return <Section style={{width,maxWidth:width,minWidth:width}}>
      <Inner>
        <Head />
        <Chats>
          {theChats.map((c,i)=> {
            const contact = contactForConversation(c, contacts.contacts)
            return <ChatRow 
              key={i} {...c} contact_photo={contact&&contact.photo_url}
              selected={c.id===scid&&c.name===scname} 
              onClick={async ()=> {
                if(ui.selectedChat&&ui.selectedChat.uuid===c.uuid) return
                msg.seeChat(c.id)
                ui.setSelectedChat(null)
                let isAppURL = false
                if(c.type===constants.chat_types.tribe) {
                  ui.setLoadingChat(true)
                  const params = await chats.getTribeDetails(c.host,c.uuid)
                  if(params && params.app_url) {
                    isAppURL = true
                    ui.setApplicationURL(params.app_url)
                  }
                  ui.setLoadingChat(false)
                }
                if(!isAppURL) {
                  ui.setApplicationURL('')
                }
                setTimeout(()=> ui.setSelectedChat(c), 5)
              }}
            />
          })}
        </Chats>
      </Inner>
      <Dragger setWidth={setWidth} maxWidth={maxWidth} />
    </Section>
  })
}

export function contactForConversation(chat: Chat, contacts: Contact[]){
  if(chat && chat.type===constants.chat_types.conversation){
    const cid = chat.contact_ids.find(id=>id!==1)
    return contacts.find(c=> c.id===cid)
  }
  return null
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