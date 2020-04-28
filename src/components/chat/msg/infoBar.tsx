import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import moment from 'moment'
import { constants } from '../../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {calcExpiry} from './utils'
import {useStores} from '../../../store'

const received = constants.statuses.received

const encryptedTypes = [
  constants.message_types.message,
  constants.message_types.invoice,
]

export default function InfoBar(props){
  const {contacts,ui} = useStores()

  const isMe = props.sender===1
  const isReceived = props.status===received
  const showLock = encryptedTypes.includes(props.type)

  const {expiry, isExpired} = calcExpiry(props)

  const isPaid = props.status===constants.statuses.confirmed
  const hasExpiry = (!isPaid&&expiry)?true:false

  const sender = contacts.contacts.find(c=>c.id===props.sender)
  const hasSender = sender?true:false

  const timeFormat = ui.is24HourFormat?'HH:mm A':'hh:mm A'
  return <View style={styles.wrap}>
    <View style={{...styles.content,
      alignSelf:isMe?'flex-end':'flex-start',
      flexDirection:isMe?'row-reverse':'row',
      }}>
      <View style={{...styles.innerContent,flexDirection:isMe?'row-reverse':'row'}}>
        {hasSender && !isMe && <Text style={styles.sender}>
          {sender.alias}  
        </Text>}
        <Text style={styles.time}>
          {moment(props.date).format(timeFormat)}
        </Text>
        {showLock && <Icon 
          name="lock" size={14} color="#AFB6BC" 
          style={{marginRight:4,marginLeft:4}}
        />}
        {isMe && isReceived && <Icon 
          name="check" size={14} color="#64C684" 
          style={{marginRight:showLock?0:4}}
        />}
      </View>
      {hasExpiry && !isExpired && <Text style={styles.exp}>
        {`Expires in ${expiry} minutes`}
      </Text>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    height:15,
    width:'100%',
    display:'flex',
  },
  content:{
    marginRight:15,
    marginLeft:15,
    maxWidth:234,
    minWidth:234,
    display:'flex',
    justifyContent:'space-between',
  }, 
  innerContent:{
    display:'flex',
  },
  time:{
    fontSize:10,
    color:'#aaa',
  },
  exp:{
    fontSize:10,
    color:'#aaa',
  },
  sender:{
    fontSize:10,
    // fontWeight:'bold',
    marginRight:5
  }
})