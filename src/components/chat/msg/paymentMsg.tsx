import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import shared from './sharedStyles'
import { constants } from '../../../constants'

export default function PaymentMsg(props) {
  const { amount, status } = props
  const isMe = props.sender === 1

  let icon, label, color
  if (isMe) {
    icon = 'arrow-top-right'
    // label = status === constants.statuses.failed ? 'FAILED' : 'SENT'
    color = status === constants.statuses.failed ? '#DB5554' : '#555'
  } else {
    icon = 'arrow-bottom-left'
    // label = 'RECEIVED'
    color = '#74ABFF'
  }

  return <View style={{ ...styles.bub, ...shared.innerPad }}>
    <View style={styles.row}>
      <View style={{ ...styles.iconWrap, backgroundColor: color }}>
        <Icon name={icon} size={15} color="white" />
      </View>
      <View style={{ ...styles.row }}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  bub: {
    // minWidth:200
  },
  amount: {
    color: '#333',
    fontSize: 18,
    marginRight: 8
  },
  sat: {
    color: '#aaa',
    fontSize: 14,
  },
  iconWrap: {
    backgroundColor: '#74ABFF',
    // height:20,width:20,
    borderRadius: 3,
    marginRight: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    // marginTop:8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
})