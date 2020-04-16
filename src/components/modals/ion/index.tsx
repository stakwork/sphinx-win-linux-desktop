import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet} from 'react-native'
import Modal from "../modalWrap"
import { Button } from 'react-native-paper'
import Header from '../modalHeader'

import {RTCView} from 'react-native-webrtc'
import {Client, Stream} from './sdk'

let client:any

export default function ION() {
  const { ui } = useStores()
  const [initted,setInitted] = useState(false)
  const [joined,setJoined] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [localStreamURL, setLocalStreamURL] = useState(null)

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
      // var stream = await client.subscribe(rid, mid, tracks)
      // console.log("STREAM",stream)
    })
    client.on("stream-remove", (id, rid) => {
      console.log("Stream Remove", "id => " + id + ", rid => " + rid)
    });
  }
  function meet(){
    console.log('meet')
    console.log(navigator)
    client = new Client()
    console.log(client)
    client.init()
    setInitted(true)
    setupNotifications()
  }

  async function join(){
    try {
      await client.join('hi', { name: 'Droid' })
      setJoined(true)
      publish()
    } catch(e) {
      console.log(e)
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
    console.log(stream.stream)
    console.log(stream.stream.toURL())
    setLocalStreamURL(stream.stream.toURL())
    console.log(stream.mid)
  }

  async function leave(){
    await client.leave()
    if(localStream){
      await client.unpublish(localStream.mid);
    }
    setJoined(false)
  }

  useEffect(()=>{
    return ()=>{
      if(client) leave()
    }
  },[])

  const hasLocalStream = localStream?true:false
  return useObserver(() =>
    <View style={styles.wrap}>
      <View style={{ backgroundColor: 'black',flex: 1 }}>
        {hasLocalStream && <RTCView streamURL={localStream.toURL()} 
          style={{flex:1}}
        />}
      </View>

      {!initted && !joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> meet()}>
          Init
        </Button>
      </View>}

      {initted && !joined && <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> join()}>
          Join
        </Button>
      </View>}

      {initted && joined && <View style={styles.buttonsWrap}>
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
  }
})