import React from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import { Props } from './types/props.interface'

export default function SmallVid(props: Props) {
  const { streamURL, styles } = props
  return <View style={styles.smallVid}>
    <RTCView streamURL={streamURL}
      style={styles.full}
      objectFit="cover" zOrder={2}
    />
  </View>
}