import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet} from 'react-native'
import Modal from "./modalWrap"
import { Button } from 'react-native-paper'
import Header from './modalHeader'
import { WebView } from 'react-native-webview';

export default function Jitsi({visible}) {
  const { ui } = useStores()

  function close(){
    console.log('close')
  }

  function jitsiDone(){

  }
  function jitsiJoined(){

  }
  function jitsiWillJoin(){

  }

  return useObserver(() =>
    <Modal visible={visible} onClose={close}>
      <Header title="Video Chat" onClose={close} />
      <View style={{ backgroundColor: 'black',flex: 1 }}>
        <WebView source={{ uri: 'https://meet.jit.si/sphinx.call' }} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  buttonsWrap:{
    marginTop:40,
    display:'flex',
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-around'
  },
  button:{
    height:46,
    borderRadius:23,
    width:120,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  }
})