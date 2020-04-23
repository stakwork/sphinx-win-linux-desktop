import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import { Button, ActivityIndicator } from 'react-native-paper'
import {RTCView} from 'react-native-webrtc'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { usePeer } from './usePeer'

export default function PeerChat({params}) {
  const { ui } = useStores()

  const peer = usePeer()

  function leave(){
    peer.destroy()
    ui.setRtcParams(null)
  }

  useEffect(()=>{
    setTimeout(()=>peer.join(), 150)
  },[])

  const hasLocalStream = peer.localStreamID?true:false
  const hasRemoteStream = peer.remoteStreamID?true:false

  return useObserver(() =>
    <View style={styles.wrap}>
      {hasLocalStream && <SmallVid streamURL={peer.localStreamID} />}

      {hasRemoteStream && <BigVid streamURL={peer.remoteStreamID}/>}
      
      {peer.joined && !hasRemoteStream && <ActivityIndicator 
        color={peer.open?'white':'grey'} animating={true}
      />}

      <View style={styles.toolbar}>
        <HangUpButton onPress={leave} />
      </View>

      {/*!joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> join()}>
          Join
        </Button>
      </View>*/}

      {/*joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={{...styles.button,backgroundColor:'#55D1A9'}}
          onPress={()=> leave()}>
          Leave
        </Button>
      </View>*/}
    </View>
  )
}

function HangUpButton({onPress}){
  return <TouchableOpacity style={{...styles.round,
    backgroundColor:'#DB5554'}} onPress={onPress}>
    <Icon name="phone-hangup" color="white" size={31} />
  </TouchableOpacity>
}

function SmallVid({streamURL}){
  return <View style={styles.smallVid}>
    <RTCView streamURL={streamURL} 
      style={styles.full}
      objectFit="cover" zOrder={2}
    />
  </View>
}
function BigVid({streamURL}){
  return <View style={styles.bigVid}>
    <RTCView streamURL={streamURL} 
      style={styles.full}
      objectFit="cover" zOrder={1}
    />
  </View>
}


const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:25,left:0,bottom:0,right:0,
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
  },
  full:{
    flex:1,position:'absolute',
    top:0,left:0,right:0,bottom:0,
  },
  toolbar:{
    position:'absolute',
    bottom:25,
    backgroundColor:'transparent',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
    zIndex:25,
  },
  round:{
    width:50,height:50,
    backgroundColor:'#ddd',
    borderRadius:25,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  bigVid:{
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    zIndex:9,
    overflow:'hidden'
  },
  smallVid:{
    height:150,
    width:150,
    borderColor:'white',
    borderWidth:1,
    position:'absolute',
    top:20,left:20,
    zIndex:999,
    overflow:'hidden'
  }
})