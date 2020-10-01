import React, { useState, useCallback } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks } from '../../../store'
import { FlatList, View, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import InviteRow from '../inviteRow'
import styles from '../inviteRow/styles'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const { useChats, useChatRow } = hooks
import { ChatRow } from './components'

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
    return <ChatRow key={chatID} styles={styles} msg={msg} {...item} />
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
    console.log("=> chatsToShow.length",chatsToShow.length)
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