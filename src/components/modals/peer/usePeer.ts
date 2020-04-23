import React, {useState} from 'react'
import Peer from 'react-native-peerjs'

function rid(){
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
async function start(){
  const id = rid()
  console.log("NEW ID:",id)
  const peer = new Peer(id)
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: {ideal:960}, height: {ideal:540} }
    })
    return {id,peer,localStream}
  } catch(e){
    console.log(e)
    return {}
  }
}
export function usePeer(){
  const [id, setID] = useState(null)
  const [localStreamID, setLocalStreamID] = useState(null)
  const [remoteStreamID, setRemoteStreamID] = useState(null)
  const [joined, setJoined] = useState(false)
  const [open, setOpen] = useState(false)
  const [thePeer, setPeer] = useState(null)

  function destroy(){
    if(thePeer) thePeer.destroy()
  }
  async function join(){
    console.log('join')
    const {id,peer,localStream} = await start()
    if(!localStream) return
    setID(id)
    setLocalStreamID(localStream.id)
    setJoined(true)

    console.log('peer',peer)
    peer.on('open', lpid=>{
      console.log('local peer open! id:',lpid)
      setOpen(true)
    })

    peer.on('error', console.log);
    
    peer.on('call', (call) => {
      console.log('on call!')
      try {
        call.answer(localStream); // Answer the call with an A/V stream.
        call.on('stream', (remoteStream) => {
          setLocalStreamID(null)
          setRemoteStreamID(remoteStream.toURL())
          console.log(localStream)
          const lsurl = localStream.id
          setLocalStreamID(lsurl)
        })
      } catch(e) {
        console.log(e)
      }
    })

    setPeer(peer)
  }

  return {
    join, destroy,
    id, joined, open,
    localStreamID, remoteStreamID
  }
}

