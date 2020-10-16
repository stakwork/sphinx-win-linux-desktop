import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { IconButton } from 'react-native-paper'
import {useTheme} from '../../../store'
import {useAvatarColor} from '../../../store/hooks/msg'

export default function ReplyContent(props) {
  const theme = useTheme()
  const extraStyles = props.extraStyles || {}
  const onCloseHandler = () => {
    if (props.onClose) props.onClose()
  }
  const nameColor = props.color || useAvatarColor(props.senderAlias || '')
  return <View style={{ ...styles.replyMsg, ...extraStyles }}>
    <View style={{...styles.replyMsgBar, backgroundColor:nameColor}} />
    <View style={{ ...styles.replyMsgContent, width: props.showClose ? '85%' : '100%' }}>
      <Text style={{...styles.replyMsgSenderAlias,color:nameColor}} numberOfLines={1}>
        {props.senderAlias || ''}
      </Text>
      <Text style={{...styles.replyMsgText,color:theme.title}} numberOfLines={1}>
        {props.content}
      </Text>
    </View>
    {props.showClose && <IconButton icon="close" size={18} color="#666"
      style={{ marginLeft: 6, marginRight: 0 }}
      onPress={onCloseHandler}
    />}
  </View>
}

const styles = StyleSheet.create({
  replyMsg: {
    height: 40,
    width: '87%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20, paddingRight: 20,
    marginTop: 6,
  },
  replyMsgBar: {
    width: 5,
    height: '90%',
    marginRight: 10
  },
  replyMsgContent: {
    display: 'flex',
  },
  replyMsgClose: {
    marginLeft: 6
  },
  replyMsgSenderAlias: {
    fontWeight: 'bold'
  },
  replyMsgText: {
    maxWidth: '100%',
  },
})