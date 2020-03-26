import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet} from 'react-native'
import Modal from "./modalWrap"
import { Button } from 'react-native-paper'
import Header from './modalHeader'
import JitsiMeet, { JitsiMeetView } from '../../jitsi';

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

  useEffect(()=>{
    console.log('hi',JitsiMeet)
  })

  function meet(){
    console.log("meet")
    try {
      const time = Date.now().valueOf()
      const url = `https://meet.jit.si/sphinx.call`
      const userInfo = { displayName: 'Evan' }
      JitsiMeet.call(url, userInfo)
    } catch(e){
      console.log(e)
    }
  }

  return useObserver(() =>
    <Modal visible={visible} onClose={close}>
      <Header title="Video Chat" onClose={close} />
      <View style={{ backgroundColor: 'black',flex: 1 }}>
        <JitsiMeetView 
          onConferenceTerminated={jitsiDone}
          onConferenceJoined={jitsiJoined} 
          onConferenceWillJoin={jitsiWillJoin} 
          style={{ flex: 1, height: '100%', width: '100%' }} 
        />
      </View>
      <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> meet()}>
          Meet
        </Button>
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