
import React from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import { useObserver } from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Chat } from '../../store/chats'
import { useStores, useTheme } from '../../store'
import { contactForConversation } from './utils'
import { constants } from '../../constants'
import { randAscii } from '../../crypto/rand'
import {RouteStatus} from './Chat/chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useChatPicSrc } from '../utils/picSrc'
import Avatar from './msg/avatar'

const conversation = constants.chat_types.conversation
const tribe = constants.chat_types.tribe

export default function Header(
  { chat, appMode, setAppMode, status }: 
  { chat: Chat, appMode: boolean, setAppMode: Function, status:RouteStatus }
) {
  const { contacts, ui, msg, details, chats } = useStores()
  const theme = useTheme()
  const navigation = useNavigation()
  return useObserver(() => {
    const theChat = chats.chats.find(c => c.id === chat.id)
    let contact
    if (chat && chat.type === conversation) {
      contact = contactForConversation(chat, contacts.contacts)
    }

    function clickTitle() {
      if (chat.type === conversation) {
        if (contact) ui.setEditContactModal(contact)
      } else {
        ui.setGroupModal(chat)
      }
    }

    async function launchVideo() {
      const id = await randAscii()
      ui.setRtcParams({ id })
    }

    const isMuted = (theChat && theChat.is_muted) || false
    async function muteChat() {
      chats.muteChat(chat.id, isMuted ? false : true)
    }

    const name = (chat && chat.name) || (contact && contact.alias)

    function onBackHandler() {
      requestAnimationFrame(()=>{
        // msg.seeChat(chat.id)
        details.getBalance()
        navigation.navigate('Home', { params: { rnd: Math.random() } })
      })
    }

    function setAppModeHandler() {
      setAppMode(!appMode)
    }
    function setShowPodHandler() {
      setShowPod(!showPod)
    }

    let uri = useChatPicSrc(chat)
    return (
      <Appbar.Header style={{ width: '100%', backgroundColor: theme.main, elevation: 5, zIndex: 102, position: 'relative', display:'flex', flexDirection:'row', alignItems:'center' }}>
        <Appbar.BackAction onPress={onBackHandler} />
        <View style={{marginRight:5}}>
          <Avatar big={false} alias={name} photo={uri || ''} />
        </View>
        <TouchableOpacity onPress={clickTitle} style={{display:'flex',flexDirection:'row',flex:1,alignItems:'center'}}>
          <Text style={{fontSize:18,color:theme.title,marginLeft:8}}>{name}</Text>
          {status!==null && <Icon name="lock" style={{marginLeft:16}} size={13} 
            color={status==='active'?theme.active:theme.inactive}
          />}
        </TouchableOpacity>
        {/* <Appbar.Action icon="video" onPress={launchVideo} color="grey" /> */}
        {theChat && <Appbar.Action icon={isMuted ? 'bell-off' : 'bell'}
          onPress={muteChat} color="grey"
        />}
        {false && theChat && theChat.type === tribe && (ui.feedURL?true:false) && <Appbar.Action 
          icon="rss" color={showPod?'#bbb':'grey'}
          onPress={setShowPodHandler}
        />}
        {theChat && theChat.type === tribe && (ui.applicationURL?true:false) && <Appbar.Action color="grey"
          icon={appMode ? 'android-messages' : 'open-in-app'}
          onPress={setAppModeHandler}
        />}
      </Appbar.Header>
    )
  })
}