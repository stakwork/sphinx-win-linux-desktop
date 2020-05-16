import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet} from 'react-native'
import Modal from "../modalWrap"
import { Button } from 'react-native-paper'
import Header from '../modalHeader'

import {RTCView} from 'react-native-webrtc'
import {Client, Stream} from './sdk'
import { fileURLToPath } from 'url'

let client:any

export default function ION() {
  const { ui } = useStores()
  const [joined,setJoined] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreamURL, setRemoteStreamURL] = useState(null)

  function close(){
    console.log('close!')
  }
  function setupNotifications(){
    client.on("peer-join", (id, rid, info) => {
      console.log("Peer Join", "peer => " + info.name + ", join!")
    })
    client.on("peer-leave", (id, rid) => {
      console.log("Peer Leave", "peer => " + id + ", leave!")
    })
    client.on("transport-open", function () {
      console.log("transport open!")
      join()
    })
    client.on("transport-closed", function () {
      console.log("transport closed!")
    })
    client.on("stream-add", async (rid, mid, info, tracks) => {
      console.log(
        "Stream Add",
        "rid => " + rid + ", mid => " + mid + ", name => " + info.name
      )
      let stream = await client.subscribe(rid, mid);
      // console.log("THIS IS A NEW STREAM",stream)
      // if(tracks){ // wtf i dunno
      //   for (let [k,v] of Object.entries(tracks)) {
      //     const confs = v
      //     const conf:{[k:string]:any} = confs[0]
      //     console.log("CONF",conf)
      //     if(conf&&conf.type==='video') setRemoteStreamURL(conf.id)
      //   }
      // }
    })
    client.on("stream-remove", (id, rid) => {
      console.log("Stream Remove", "id => " + id + ", rid => " + rid)
    });
  }

  async function join(){
    console.log("JOINNNNN")
    if(!client) {
      let url = `wss://rtc.sphinx.chat:8443`;
      client = new Client()
      client.init()
      setupNotifications()
      console.log(client)
    } else {
      try {
        await client.join('hi', { name: 'Droid' })
        setJoined(true)
        publish()
      } catch(e) {
        console.log(e)
      }
    }
  }

  async function publish(){
    let stream = await client.publish({
      codec: "vp8",
      resolution: "hd",
      bandwidth: 1024,
      audio: true,
      video: true,
      screen: false,
    })
    setLocalStream(stream.stream)
    console.log("STREAM=",stream.stream)
    console.log(stream.stream.toURL())
    console.log(stream.stream)
  }

  async function leave(){
    await client.leave()
    if(localStream){
      await client.unpublish(localStream.mid);
    }
    setJoined(false)
    setLocalStream(null)
  }

  useEffect(()=>{
    return ()=>{
      if(client) leave()
    }
  },[])

  const hasLocalStream = localStream?true:false
  const hasRemoteStream = remoteStreamURL?true:false

  return useObserver(() =>
    <View style={styles.wrap}>
      {hasLocalStream && <RTCView streamURL={localStream.toURL()} 
        style={{...styles.full}}
      />}
      {/* {hasRemoteStream && <RTCView streamURL={remoteStreamURL} 
        style={{...styles.full}}
      />} */}

      {!joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> join()}>
          Join
        </Button>
      </View>}

      {joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={{...styles.button,backgroundColor:'#55D1A9'}}
          onPress={()=> leave()}>
          Leave
        </Button>
      </View>}
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
  },
  full:{
    flex:1,position:'absolute',
    top:0,left:0,right:0,bottom:0,
  }
})