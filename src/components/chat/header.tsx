import React from 'react'
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native'
import { useObserver } from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Chat } from '../../store/chats'
import { useStores, useTheme } from '../../store'
import { contactForConversation } from './utils'
import { constants } from '../../constants'
import { randAscii } from '../../crypto/rand'
import {RouteStatus} from './chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useChatPicSrc } from '../utils/picSrc'
import Avatar from './msg/avatar'

const conversation = constants.chat_types.conversation
const tribe = constants.chat_types.tribe

export default function Header(
  { chat, appMode, setAppMode, status, tribeParams, earned, spent }: 
  { chat: Chat, appMode: boolean, setAppMode: Function, status:RouteStatus, tribeParams:{[k:string]:any}, earned:number, spent:number }
) {
  const { contacts, ui, user, details, chats } = useStores()
  const isTribeAdmin = tribeParams&&tribeParams.owner_pubkey===user.publicKey
  const isPodcast = (tribeParams&&tribeParams.feed_url)?true:false
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
    let uri = useChatPicSrc(chat)
    const appURL = tribeParams&&tribeParams.app_url
    return (
      <Appbar.Header style={{ width: '100%', backgroundColor: theme.main, elevation: 5, zIndex: 102, position: 'relative', display:'flex', flexDirection:'row', alignItems:'center' }}>
        <Appbar.BackAction onPress={onBackHandler} />
        <View>
          <Avatar big={false} alias={name} photo={uri || ''} />
        </View>
        <View style={styles.textWrap}>
          <TouchableOpacity onPress={clickTitle} style={styles.title}>
            <Text style={{fontSize:18,color:theme.title}}>{name}</Text>
            {status!==null && <Icon name="lock" style={{marginLeft:16}} size={13} 
              color={status==='active'?theme.active:theme.inactive}
            />}
          </TouchableOpacity>
          {isPodcast && <Text style={{...styles.stats,color:theme.title}}>
            {isTribeAdmin?`Earned: ${earned} sats`:`Contributed: ${spent} sats`}  
          </Text>}
        </View>
        {/* <Appbar.Action icon="video" onPress={launchVideo} color="grey" /> */}
        {theChat && <Appbar.Action icon={isMuted ? 'bell-off' : 'bell'}
          onPress={muteChat} color="grey" style={{position:'absolute',right:10}}
        />}
        {theChat && theChat.type === tribe && (appURL?true:false) && <Appbar.Action color="grey"
          icon={appMode ? 'android-messages' : 'open-in-app'}
          onPress={setAppModeHandler}
        />}
      </Appbar.Header>
    )
  })
}

const styles = StyleSheet.create({
  title:{
    display:'flex',
    flexDirection:'row',
    flex:1,
    alignItems:'center'
  },
  textWrap:{
    display:'flex',
    marginLeft:13,
  },
  stats:{
    color:'white',
    fontSize:10,
    marginBottom:7
  }
})