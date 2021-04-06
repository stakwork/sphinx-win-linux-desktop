import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet} from 'react-native'
import Modal from "./modalWrap"
import { Button } from 'react-native-paper'
import Header from './modalHeader'
import JitsiMeet, { JitsiMeetView } from '../../native-module-wrappers/jitsi';

console.log("ASDF",JitsiMeet, JitsiMeetView)

export default function Jitsi() {
  const { ui } = useStores()
  const [showJitsi, setShowJitsi] = useState(true)

  function close(){
    console.log('close!')
  }

  function jitsiDone(){

  }
  function jitsiJoined(){
    setShowJitsi(false);
    setTimeout(()=>{
      setShowJitsi(true)
    },100)
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
    <View style={styles.wrap}>
      <View style={{ backgroundColor: 'black',flex: 1 }}>
        {showJitsi && <JitsiMeetView
          onConferenceTerminated={jitsiDone}
          onConferenceJoined={jitsiJoined}
          onConferenceWillJoin={jitsiWillJoin}
          style={{ flex: 1, height: '100%', width: '100%' }}
        />}
      </View>
      <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> meet()}>
          Meet
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'black'
  },
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
