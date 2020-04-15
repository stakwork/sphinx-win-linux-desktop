import React from 'react'
import {useObserver} from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { useNavigation,useRoute } from '@react-navigation/native'
import {Chat} from '../../store/chats'
import {useStores} from '../../store'
import {contactForConversation} from './utils'
import { constants } from '../../constants'

const conversation = constants.chat_types.conversation

export default function Header({chat}:{chat: Chat}) {
  const {contacts,ui,msg,details} = useStores()
  const navigation = useNavigation()

  function clickTitle(){
    if(chat.type===conversation){
      const contact = contactForConversation(chat, contacts.contacts)
      if(contact) ui.setEditContactModal(contact)
    } else {
      ui.setGroupModal(chat)
    }
  }

  const {name} = chat
  return useObserver(()=>
    <Appbar.Header style={{width:'100%',backgroundColor:'white',elevation:5}}>
      <Appbar.BackAction onPress={()=>{
        msg.seeChat(chat.id)
        details.getBalance()
        navigation.navigate('Home', {params:{rnd:Math.random()}})
      }} />
      <Appbar.Content title={name} onPress={clickTitle} />
      {/* <Appbar.Action icon="bell-outline" onPress={handleMore} /> */}
    </Appbar.Header>
  )
}
