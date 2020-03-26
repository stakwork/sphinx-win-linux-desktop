import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PaymentMsg(props){
  const {amount} = props
  const isMe = props.sender===1
  const icon = isMe?'arrow-top-right':'arrow-bottom-left'
  const label = isMe?'SENT':'RECEIVED'
  const color = isMe?'#555':'#74ABFF'
  return <View style={styles.bub}>
    <View style={styles.row}>
      <View style={{...styles.iconWrap,backgroundColor:color}}>
        <MaterialCommunityIcons name={icon} size={15} color="white" />
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