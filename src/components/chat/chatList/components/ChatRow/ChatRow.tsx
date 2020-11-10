import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { TouchableOpacity, View, Text, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useChatPicSrc } from '../../../../utils/picSrc'
import Avatar from '../../../msg/avatar'
import { useStores, hooks, useTheme } from '../../../../../store'
import { Props } from './types/props.interface'

import moreStyles from './styles'

export default function ChatRow(props: Props | any) {
  const { name, styles } = props
  const { msg } = useStores()
  const { useChatRow } = hooks
  const navigation = useNavigation()

  const onSeeChatHandler = () => {
    msg.seeChat(props.id)
    // msg.getMessages()
    navigation.navigate('Dashboard', {
      screen: 'Chat', params: props
    })
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
        <Text style={{ ...styles.chatName, color: theme.dark ? '#ddd' : '#666' }}>{name}</Text>
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