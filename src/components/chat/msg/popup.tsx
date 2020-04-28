import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

export default function Popup(props){
  const isMe = props.sender===1
  const sty: {[k:string]:any} = {
    position:'absolute',
    backgroundColor:'#999',
    padding:5,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:5,
    top:props.showInfoBar?-12:-27
  }
  if(isMe) sty.right=15
  else sty.left=15
  return <View style={sty}>
    <Text style={{color:'white'}}>Copied!</Text>
  </View>
}
