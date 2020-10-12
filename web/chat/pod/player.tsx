import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import AudioPlayer from 'react-h5-audio-player';
import { useStores } from '../../../src/store'

export default function Player({pod,episode}){
  const { feed } = useStores()
  const [secs,setSecs] = useState(0)
  const interval = useRef(null);

  function sendPayments(){
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations
    if(!dests) return
    if(!pod.id || !episode.id) return
    const memo = JSON.stringify({
      feedID: pod.id,
      itemID: episode.id,
    })
    feed.sendPayments(dests,memo)
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