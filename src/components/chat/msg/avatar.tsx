import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import {useAvatarColor} from '../../../store/hooks/msg'

export default function Avatar(props) {
  const name = props.alias || 'Sphinx'
  const photo = props.photo
  const size = props.big ? 52 : 32
  const borderRadius = props.big ? 26 : 16
  let initial = ''
  const arr = name.split(' ')
  arr.forEach((str, i) => {
    if (i < 2) initial += str.substring(0, 1).toUpperCase()
  })
  if (photo) {
    return <View style={{ ...styles.avatar, height: size, width: size, borderRadius, opacity: props.hide ? 0 : 1 }}>
      <FastImage source={{ uri: photo }}
        style={{ width: size, height: size }} resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  }
  return <View style={{
    ...styles.wrap, height: size, width: size, borderRadius,
    opacity: props.hide ? 0 : 1,
    backgroundColor: useAvatarColor(name)
  }}>
    <Text style={{
      ...styles.initial,
      letterSpacing: props.big ? 2 : 0,
      fontSize: props.big ? 18 : 15
    }}>
      {initial}
    </Text>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 8,
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: 'white',
    marginBottom: 1,
    marginRight: 1,
  },
  avatar: {
    marginLeft: 8,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
})