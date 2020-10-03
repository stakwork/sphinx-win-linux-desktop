import React, { useState, useCallback } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks, useTheme } from '../../store'
import { TouchableOpacity, FlatList, View, Text, StyleSheet, Dimensions } from 'react-native'
import { Button } from 'react-native-paper'
import InviteRow, { styles } from './inviteRow'
import { useNavigation } from '@react-navigation/native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useChatPicSrc } from '../utils/picSrc'
import Avatar from './msg/avatar'
const { useChats, useChatRow } = hooks

export default function ChatList() {
  const { ui, contacts, msg, details } = useStores()
  
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    })
    setRefreshing(true)
    await contacts.getContacts()
    await msg.getMessages()
    await details.getBalance()
    setRefreshing(false)
  }, [refreshing])

  /**
   * renderItem component
   * @param {object} item - item object getting from map chatToShow array
   * @param {number} index - index of item in the array
   */
  const renderItem: any = ({ item, index }) => {
    const chatID = (item.id || rando()) + ''
    let showInvite = false
    if (item.invite && item.invite.status !== 4) showInvite = true
    if (showInvite) return <InviteRow key={`invite_${index}`} {...item} />
    return <ChatRow key={chatID} {...item} />
  }

  const setAddFriendModalHandler = () => ui.setAddFriendModal(true)
  const setNewGroupModalHandler = () => ui.setNewGroupModal(true)

  const footerComponent: any = () => (
    <View style={moreStyles.buttonsWrap}>
      <Button mode="contained" dark={true} icon="plus"
        onPress={setAddFriendModalHandler}
        style={{ ...moreStyles.button, backgroundColor: '#55D1A9' }}>
        Friend
      </Button>
      <Button mode="contained" dark={true} icon="plus"
        style={moreStyles.button}
        onPress={setNewGroupModalHandler}>
        Group
      </Button>
    </View>
  )

  return useObserver(() => {
    const chatsToShow = useChats()
    // console.log("=> chatsToShow.length",chatsToShow.length)
    return <View style={{ width: '100%', flex: 1 }}>
      <FlatList<any>
        data={chatsToShow}
        renderItem={renderItem}
        keyExtractor={(item) => {
          if(!item.id) {
            const contact_id = item.contact_ids.find(id=>id!==1)
            return 'contact_'+String(contact_id)
          }
          return String(item.id)
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={footerComponent}
      />
    </View>
  })
}

function ChatRow(props) {
  const { id, name, contact_ids } = props
  const navigation = useNavigation()
  const { msg, user } = useStores()

  const onSeeChatHandler = () => {
    setTimeout(()=>{
      msg.seeChat(props.id)
      // msg.getMessages()
      navigation.navigate('Dashboard', {
        screen: 'Chat', params: props
      })
    },1)
  }

  const theme = useTheme()
  return useObserver(() => {
    let uri = useChatPicSrc(props)
    const hasImg = uri ? true : false

    const { lastMsgText, hasLastMsg, unseenCount, hasUnseen } = useChatRow(props.id)

    const w = Math.round(Dimensions.get('window').width)
    return <TouchableOpacity style={{
      ...styles.chatRow,
      backgroundColor:theme.main,
      borderBottomColor: theme.dark?'#0d1319':'#e5e5e5',
    }} activeOpacity={0.5}
      onPress={onSeeChatHandler}>
      <View style={styles.avatarWrap}>
        <Avatar big alias={name} photo={uri || ''} />
        {hasUnseen && <View style={moreStyles.badgeWrap}>
          <View style={moreStyles.badge}>
            <Text style={moreStyles.badgeText}>{unseenCount}</Text>
          </View>
        </View>}
      </View>
      <View style={styles.chatContent}>
        <Text style={{...styles.chatName,color:theme.dark?'#ddd':'#666'}}>{name}</Text>
        {hasLastMsg && <Text numberOfLines={1}
          style={{
            ...styles.chatMsg,
            fontWeight: hasUnseen ? 'bold' : 'normal',
            maxWidth: w - 105,
            color: theme.dark?'#8b98b4':'#7e7e7e',
          }}>
          {lastMsgText}
        </Text>}
      </View>
    </TouchableOpacity>
  })
}

const moreStyles = StyleSheet.create({
  buttonsWrap: {
    marginTop: 40,
    marginBottom: 25,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around'
  },
  button: {
    height: 46,
    borderRadius: 23,
    width: 140,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#DB5554',
    width: 18, height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  badgeText: {
    color: 'white',
    fontSize: 10
  }
})

function rando() {
  return Math.random().toString(36).substring(7);
}