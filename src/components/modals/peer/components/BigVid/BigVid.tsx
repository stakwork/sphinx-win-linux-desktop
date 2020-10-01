import React from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import { Props } from './types/props.interface'

export default function BigVid(props: Props) {
  const { streamURL, styles } = props
  return <View style={styles.bigVid}>
    <RTCView streamURL={streamURL}
      style={styles.full}
      objectFit="cover" zOrder={1}
    />
  </View>
}