import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import AudioPlayer from 'react-h5-audio-player';
import { useStores } from '../../../src/store'

type DestinationType = 'wallet' | 'node'
interface Destination {
  address: string
  split: number
  type: DestinationType
}

export default function Player({pod,episode}){
  const { msg } = useStores()
  const [secs,setSecs] = useState(0)
  const interval = useRef(null);

  function sendPayments(){
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations
    if(!dests) return

    // const TOTAL = 10
    asyncForEach(dests, async (d:Destination)=>{
      if(d.type==='node') {
        await msg.sendPayment({
          contact_id: null, chat_id: null,
          destination_key: d.address,
          amt: 3,
          memo: '',
        })
      }
      if(d.type==='wallet'){
        await msg.payInvoice({
          payment_request: d.address,
          amount: 3
        })
      }
    })
  }
  const NUM_SECONDS = 60
  function tick(){
    setSecs(s=>{
      if(s && s%NUM_SECONDS===0) {
        sendPayments()
      }
      return s+1
    })
  }
  function onPlay(){
    const dests = pod.value && pod.value.destinations
    if(!dests) return
    interval.current = setInterval(tick, 1000)
  }
  function onPause(){
    clearInterval(interval.current);
  }

  return <PodPlayer>
    {episode && <AudioPlayer
      autoPlay={false}
      src={episode.enclosureUrl}
      onPlay={onPlay}
      onPause={onPause}
      loop={false}
      customAdditionalControls={[]}
      showDownloadProgress={false}
      showFilledProgress={false}
    // other props here
    />}
  </PodPlayer>
}


const PodPlayer = styled.div`
  display: flex;
  flex-direction: column;

  & .rhap_container{
    background-color: #141d27;
  }
  & .rhap_main-controls-button{
    color: #809ab7;
  }
  & .rhap_progress-indicator{
    background-color: #809ab7
  }
  & .rhap_progress-filled{
    background-color: #809ab7
  }
  & .rhap_progress-bar{
    background-color: #809ab7
  }
  & .rhap_current-time{
    color: #809ab7;
    font-size: 13px;
  }
  & .rhap_time{
    color: #809ab7;
    font-size: 13px;
  }
  & .rhap_volume-indicator{
    background: #809ab7;
  }
  & .rhap_volume-button{
    color: #809ab7;
  }
`

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}