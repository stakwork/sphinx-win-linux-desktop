import React from 'react'
import { Appbar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function Header() {
  const navigation = useNavigation()
  const onGoBackHandler = () => navigation.goBack()
  return (
    <Appbar.Header style={{width:'100%',elevation:0,backgroundColor:'white'}}>
      <Appbar.BackAction onPress={onGoBackHandler} color="#666" />
      <Appbar.Content title="Address Book" />
    </Appbar.Header>
  )
}