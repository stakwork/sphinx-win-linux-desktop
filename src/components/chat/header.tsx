import React from 'react'
import {useObserver} from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { useNavigation,useRoute } from '@react-navigation/native'
import {Chat} from '../../store/chats'
import {useStores} from '../../store'
import {contactForConversation} from './utils'
import { constants } from '../../constants'
import {randAscii} from '../../crypto/rand'

const conversation = constants.chat_types.conversation

export default function Header({chatID}) {
  const {contacts,ui,msg,details,chats} = useStores()
  const navigation = useNavigation()

  return useObserver(()=> {
    const chat = chats.chats.find(c=> c.id===chatID)

    function clickTitle(){
      if(chat.type===conversation){
        const contact = contactForConversation(chat, contacts.contacts)
        if(contact) ui.setEditContactModal(contact)
      } else {
        ui.setGroupModal(chat)
      }
    }

    async function launchVideo(){
      const id = await randAscii()
      ui.setRtcParams({id})
    }

    async function muteChat(){
      console.log("OK CANGE NOW",chat.is_muted?false:true)
      chats.muteChat(chat.id, chat.is_muted?false:true)
    }

    const {name,is_muted} = chat
    console.log("IS MUTED!",is_muted)
    return (
      <Appbar.Header style={{width:'100%',backgroundColor:'white',elevation:5}}>
        <Appbar.BackAction onPress={()=>{
          msg.seeChat(chat.id)
          details.getBalance()
          navigation.navigate('Home', {params:{rnd:Math.random()}})
        }} />
        <Appbar.Content title={name} onPress={clickTitle} />
        {/* <Appbar.Action icon="video" onPress={launchVideo} color="grey" /> */}
        <Appbar.Action icon={chat.is_muted?'bell-off':'bell'} onPress={muteChat} color="grey" />
      </Appbar.Header>
    )
  })
}

