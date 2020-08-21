import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { constants } from '../../../constants'
import { useStores } from '../../../store'
import { calcExpiry } from './utils'
import shared from './sharedStyles'

export default function Invoice(props) {
  const { ui } = useStores()

  const { amount } = props
  const isMe = props.sender === 1
  const isPaid = props.status === constants.statuses.confirmed

  const { isExpired } = calcExpiry(props)

  let label = isMe ? 'REQUEST SENT' : 'REQUEST'
  let color = '#555'
  let opacity = 1
  if (isPaid) {
    color = isMe ? '#555' : '#74ABFF'
    label = 'REQUEST PAID'
  } else { // if unpaid, check expiry
    if (isExpired) opacity = 0.35
  }

  const showPayButton = !isPaid && !isMe
  const hasContent = props.message_content ? true : false

  function openConfirmModal() {
    const checkAgain = calcExpiry(props)
    if (!checkAgain.isExpired) {
      ui.setConfirmInvoiceMsg(props)
    }
  }

  return <View style={{ ...styles.bub, opacity, ...shared.innerPad }}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name="qrcode" size={22} color={color} />
      </View>
      <Text style={{ ...styles.label, color }}>{label}</Text>
    </View>
    <View style={{ ...styles.row, marginTop: 12 }}>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.sat}>sat</Text>
    </View>
    {hasContent && <View style={{ ...styles.row, marginTop: 12 }}>
      <Text style={styles.text}>{props.message_content}</Text>
    </View>}
    {showPayButton && !isExpired && <View style={{ ...styles.row, marginTop: 12 }}>
      <Button style={styles.payButton} mode="contained" dark={true}
        onPress={() => openConfirmModal()}
        icon="arrow-top-right">
        Pay
      </Button>
    </View>}
  </View>
}

const styles = StyleSheet.create({
  bub: {
    minWidth: 200,
    maxWidth: 200,
  },
  amount: {
    color: '#333',
    fontSize: 28,
    marginRight: 8
  },
  sat: {
    color: '#aaa',
    fontSize: 14,
  },
  label: {
    color: '#74ABFF',
    fontSize: 10,
  },
  iconWrap: {
    height: 25, width: 25,
    borderRadius: 3,
    marginRight: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    color: '#333',
    fontSize: 16,
  },
  payButton: {
    backgroundColor: '#4AC998',
    width: '100%',
    borderRadius: 5,
  }
})