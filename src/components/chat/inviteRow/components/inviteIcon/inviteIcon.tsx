import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function inviteIcon(statusString) {
  switch (statusString) {
    case 'payment_pending':
      return <Icon
        name="credit-card" size={14} color="grey" style={{ marginRight: 4 }}
      />
    case 'ready':
      return <Icon
        name="check" size={14} color="#64C684" style={{ marginRight: 4 }}
      />
    case 'delivered':
      return <Icon
        name="check" size={14} color="#64C684" style={{ marginRight: 4 }}
      />
    default:
      return <></>
  }
}