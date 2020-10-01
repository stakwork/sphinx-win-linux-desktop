import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useStores } from '../../../../../store'
import { Props } from './types/props.interface'

export default function Payment(props: Props) {
  const { contacts } = useStores()
  const { amount, type, date, pubkey, payment_hash, styles } = props
  const params = {
    payment: {
      icon:'arrow-top-right',
      color:'#FFA292',
      background:'white'
    },
    invoice:{
      icon:'arrow-bottom-left',
      color:'#94C4FF',
      background:'#F6FBFE'
    }
  }

  let text = '-'
  const contact = contacts.contacts.find(c=>c.public_key===pubkey)
  if(contact) text = contact.alias
  if(!contact && type==='payment') text=pubkey

  const p = params[type]
  return <View style={{...styles.payment,backgroundColor:p.background}}>
    <Icon name={p.icon} color={p.color} size={32}
      style={{marginLeft:10}}
    />
    <View style={styles.mid}>
      <Icon name="message-text-outline" color="#bbb" size={18} 
        style={{marginLeft:15}}
      />
      <Text style={styles.contact} numberOfLines={1}>{text}</Text>
    </View>
    <View style={styles.amountWrap}>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.sat}>sat</Text>
    </View>
  </View>
}