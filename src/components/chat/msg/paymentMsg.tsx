import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import shared from './sharedStyles'
import { constants } from '../../../constants'

export default function PaymentMsg(props){
  const {amount, status} = props
  const isMe = props.sender===1

  let icon, label, color
  if (isMe) {
    icon = 'arrow-top-right'
    label = status === constants.statuses.failed ? 'FAILED' : 'SENT'
    color = status === constants.statuses.failed ? '#F00' : '#555'
  } else {
    icon = 'arrow-bottom-left'
    label = 'RECEIVED'
    color = '#74ABFF'
  } 

  return <View style={{...styles.bub, ...shared.innerPad}}>
    <View style={styles.row}>
      <View style={{...styles.iconWrap,backgroundColor:color}}>
        <Icon name={icon} size={15} color="white" />
      </View>
      <Text style={{...styles.label,color}}>{label}</Text>
    </View>
    <View style={{...styles.row,marginTop:12}}>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.sat}>sat</Text>
    </View>
  </View>
}

const styles = StyleSheet.create({
  bub:{
    minWidth:200
  },
  amount:{
    color:'#333',
    fontSize:28,
    marginRight:8
  },
  sat:{
    color:'#aaa',
    fontSize:14,
  },
  label:{
    color:'#74ABFF',
    fontSize:10,
  },
  iconWrap:{
    backgroundColor:'#74ABFF',
    height:20,width:20,
    borderRadius:3,
    marginRight:8,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  row:{
    marginTop:8,
    display:'flex',
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
  }
})