import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { constants } from '../../../constants'
import { useStores, useTheme } from '../../../store'

export default function GroupNotification(props) {
  const { contacts } = useStores()
  const theme = useTheme()

  let senderAlias = 'Unknown'
  if (props.isTribe) {
    senderAlias = props.sender_alias
  } else {
    const sender = contacts.contacts.find(c => c.id === props.sender)
    senderAlias = sender && sender.alias
  }

  const isJoin = props.type === constants.message_types.group_join

  return <View style={styles.wrap}>
    <View style={{...styles.content,
      backgroundColor:theme.dark?'#202a36':'#F9FAFC',
      borderColor:theme.main
    }}>
      <Text style={styles.text}>
        {`${senderAlias} has ${isJoin ? 'joined' : 'left'} the group`}
      </Text>
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    height: 25,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 12,
    height:23,
    borderColor: '#DADFE2',
    marginTop: 5,
  },
  text: {
    fontSize: 12,
    color: '#777'
  }
})