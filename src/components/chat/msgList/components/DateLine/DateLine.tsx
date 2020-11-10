import React from 'react'
import { View, Text } from 'react-native'
import { Props } from './types/props.interface'

export default function DateLine(props: Props) {
  const { dateString, styles } = props
  return <View style={styles.dateLine}>
    <View style={styles.line}></View>
    <Text style={styles.dateString}>{dateString}</Text>
  </View>
}