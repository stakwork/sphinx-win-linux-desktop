import React, { useState, useCallback } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks } from '../../store'
import { TouchableOpacity, ScrollView, RefreshControl, View, Text, StyleSheet, Image, Dimensions } from 'react-native'
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

  return useObserver(() => {
    const chatsToShow = useChats()
    return <ScrollView style={{ width: '100%', flex: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {chatsToShow.map((c, i) => {
        const chatID = (c.id || rando()) + ''
        let showInvite = false
        if (c.invite && c.invite.status !== 4) showInvite = true
        if (showInvite) return <InviteRow key={`invite_${i}`} {...c} />
        return <ChatRow key={chatID} {...c} />
      })}
      <View style={moreStyles.buttonsWrap}>
        <Button mode="contained" dark={true} icon="plus"
          onPress={() => ui.setAddFriendModal(true)}
          style={{ ...moreStyles.button, backgroundColor: '#55D1A9' }}>
          Friend
        </Button>
        <Button mode="contained" dark={true} icon="plus"
          style={moreStyles.button}
          onPress={() => ui.setNewGroupModal(true)}>
          Group
        </Button>
      </View>
    </ScrollView>
  })
}

function ChatRow(props) {
  const { id, name, contact_ids } = props
  const navigation = useNavigation()
  const { msg, user } = useStores()

  return useObserver(() => {
    let uri = useChatPicSrc(props)
    const hasImg = uri ? true : false

    const { lastMsgText, hasLastMsg, unseenCount, hasUnseen } = useChatRow(props.id)

    const w = Math.round(Dimensions.get('window').width)
    return <TouchableOpacity style={styles.chatRow} activeOpacity={0.5}
      onPress={() => {
        msg.seeChat(props.id)
        // msg.getMessages()
        navigation.navigate('Dashboard', {
          screen: 'Chat', params: props
        })
      }}>
      <View style={styles.avatarWrap}>
        <Avatar big alias={name} photo={uri || ''} />
        {hasUnseen && <View style={moreStyles.badgeWrap}>
          <View style={moreStyles.badge}>
            <Text style={moreStyles.badgeText}>{unseenCount}</Text>
          </View>
        </View>}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{name}</Text>
        {hasLastMsg && <Text numberOfLines={1}
          style={{
            ...styles.chatMsg,
            fontWeight: hasUnseen ? 'bold' : 'normal',
            maxWidth: w - 105
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