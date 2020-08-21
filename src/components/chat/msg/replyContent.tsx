import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { IconButton } from 'react-native-paper'

export default function ReplyContent(props) {
  const extraStyles = props.extraStyles || {}
  return <View style={{ ...styles.replyMsg, ...extraStyles }}>
    <View style={styles.replyMsgBar} />
    <View style={{ ...styles.replyMsgContent, width: props.showClose ? '85%' : '100%' }}>
      <Text style={styles.replyMsgSenderAlias} numberOfLines={1}>
        {props.reply_message_sender_alias || ''}
      </Text>
      <Text style={styles.replyMsgText} numberOfLines={1}>
        {props.reply_message_content}
      </Text>
    </View>
    {props.showClose && <IconButton icon="close" size={18} color="#666"
      style={{ marginLeft: 6, marginRight: 0 }}
      onPress={() => {
        if (props.onClose) props.onClose()
      }}
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
    backgroundColor: '#999',
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