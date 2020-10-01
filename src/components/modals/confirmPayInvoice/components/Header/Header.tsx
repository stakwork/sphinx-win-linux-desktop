import React from 'react'
import { View, Text } from 'react-native'
import { IconButton } from 'react-native-paper'
import { Props } from './types/props.interface'

export default function Header(props: Props | any) {
  const { onClose, styles } = props
  return <View style={{...styles.header, ...props.background && { backgroundColor: props.background}}}>
    <View style={styles.headerLefty}>
      <Text style={styles.headerLabel}>REQUEST:</Text>
      <Text style={styles.headerAmt}>{props.amt||0}</Text>
      <Text style={styles.headerSat}>sat</Text>
    </View>
    <IconButton
      icon="close"
      color="#DB5554"
      size={22}
      style={{ marginRight: 32, marginTop: 8 }}
      onPress={onClose}
    />
  </View>
}