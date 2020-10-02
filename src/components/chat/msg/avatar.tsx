import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'

const colorz = ["#FF70E9", "#7077FF", "#DBD23C", "#F57D25", "#9F70FF", "#9BC351", "#FF3D3D", "#C770FF", "#62C784", "#C99966", "#76D6CA", "#ABDB50", "#FF708B", "#5AD7F7", "#5FC455", "#FF9270", "#3FABFF", "#56D978", "#FFBA70", "#5078F2", "#618AFF"]

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
    backgroundColor: getColor(name)
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

function getColor(s) {
  const hc = hashCode(s.repeat(Math.round(32 / s.length)))
  const int = Math.round(Math.abs(
    hc / 2147483647 * colorz.length
  ))
  return colorz[Math.min(int, 20)]
}

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
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