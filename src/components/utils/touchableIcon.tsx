import React from 'react'
import {TouchableRipple} from 'react-native-paper'

export default function TouchableIcon(props){
  return <TouchableRipple onPress={props.onPress}
    style={{
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:props.color||'transparent',
      width:props.size||48,
      height:props.size||48,
      borderRadius:props.size/2||24,
    }} 
    rippleColor={props.rippleColor||'white'}
    borderless>
    {props.children}
  </TouchableRipple>
}
