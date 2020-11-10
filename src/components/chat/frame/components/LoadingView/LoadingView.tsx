import React from 'react'
import { View, ActivityIndicator } from 'react-native'

export default function LoadingView({ style }) {
  return <View style={style}>
    <ActivityIndicator
      animating={true}
      color='grey'
      size="large"
      hidesWhenStopped={true}
    />
  </View>
}