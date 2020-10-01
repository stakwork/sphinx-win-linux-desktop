import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Props } from './types/props.interface'

export default function HangUpButton(props: Props) {
  const { onPress, styles } = props
  return <TouchableOpacity style={{...styles.round,
    backgroundColor:'#DB5554'}} onPress={onPress}>
    <Icon name="phone-hangup" color="white" size={31} />
  </TouchableOpacity>
}