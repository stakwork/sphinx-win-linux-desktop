import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Popup(props) {
  const isMe = props.sender === props.myid
  const sty: { [k: string]: any } = {
    top: props.showInfoBar ? -12 : -27
  }
  if (isMe) sty.right = 15
  else sty.left = 15
  return <View style={{ ...styles.wrap, ...sty }}>
    <Text style={{ color: 'white' }}>Copied!</Text>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    backgroundColor: '#999',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    zIndex: 100,
  }
})