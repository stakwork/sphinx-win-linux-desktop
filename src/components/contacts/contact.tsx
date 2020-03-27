import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {Appbar} from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function Contact(){
  return <View style={styles.main}>
    <Header />
    <Text>hi</Text>
  </View>
}

function Header() {
  const navigation = useNavigation()
  return (
    <Appbar.Header style={{width:'100%',elevation:0}}>
      <Appbar.Action icon="back" onPress={()=>navigation.goBack()} />
      <Appbar.Content title="EDIT CONTACT" />
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  main:{
    display:'flex',
    width:'100%',height:'100%',
    backgroundColor:'white'
  }
})
