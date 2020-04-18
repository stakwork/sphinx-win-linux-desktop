import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import { Button } from 'react-native-paper'
import Peer from 'react-native-peerjs';
import {RTCView} from 'react-native-webrtc'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function PeerChat() {
  const { ui } = useStores()
  const [joined,setJoined] = useState(false)
  const [ls, setLocalStream] = useState(null)
  const [localStreamURL, setLocalStreamURL] = useState(null)
  const [remoteStreamURL, setRemoteStreamURL] = useState(null)

  function close(){
    console.log('close!')
  }
  async function start(){
    const peer = new Peer('droid');
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: { ideal: 960 }, height: { ideal: 540 } }
    })
    setLocalStream(localStream)
    setJoined(true)
    return {peer,localStream}
  }
  async function join(){
    console.log('join')

    const {peer,localStream} = await start()

    console.log('localPeer',peer)

    peer.on('open', lpid=>{
      console.log('local peer open! id:',lpid)
    })

    peer.on('error', console.log);
    
    peer.on('call', (call) => {
      console.log('on call!')
      try {
        call.answer(localStream); // Answer the call with an A/V stream.
        call.on('stream', (remoteStream) => {
          setRemoteStreamURL(remoteStream.toURL())
          console.log(localStream)
          const lsurl = localStream.id
          setLocalStreamURL(lsurl)
        })
      } catch(e) {
        console.log(e)
      }
    })
  }
  function leave(){

  }

  // useEffect(()=>{
  //   join()
  //   return ()=> {
  //     leave()
  //   }
  // },[])

  const hasLocalStream = localStreamURL?true:false
  const hasRemoteStream=remoteStreamURL?true:false

  return useObserver(() =>
    <View style={styles.wrap}>
      {hasLocalStream && <SmallVid streamURL={localStreamURL} />}

      {hasRemoteStream && <BigVid streamURL={remoteStreamURL}/>}

      <View style={styles.toolbar}>
        <HangUpButton />
      </View>

      {!joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> join()}>
          Join
        </Button>
      </View>}

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

function HangUpButton({}){
  return <TouchableOpacity style={{...styles.round,
    backgroundColor:'#DB5554'}}>
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
    height:180,
    width:180,
    borderColor:'white',
    borderWidth:1,
    position:'absolute',
    top:20,left:20,
    zIndex:999,
    overflow:'hidden'
  }
})