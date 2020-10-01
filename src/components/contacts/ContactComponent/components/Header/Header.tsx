import React from 'react'
import {Appbar} from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function Header() {
  const navigation = useNavigation()
  return (
    <Appbar.Header style={{width:'100%',elevation:0}}>
      <Appbar.Action icon="back" onPress={()=>navigation.goBack()} />
      <Appbar.Content title="EDIT CONTACT" />
    </Appbar.Header>
  )
}