import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import AudioPlayer from 'react-h5-audio-player';
import { useStores } from '../../../src/store'
import Message from '@material-ui/icons/Message'

export default function Player({pod,episode,pricePerMinute}){
  const { feed, ui } = useStores()
  const [secs,setSecs] = useState(0)
  const interval = useRef(null);

  function tsToSeconds(hms){
    var a = hms.split(':')
    if(a.length!==3) return 0
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
  }
  function getTS(){
    let ts = 0
    const el = document.getElementById('rhap_current-time')
    if(el) ts = tsToSeconds(el.innerHTML)
    return ts
  }

  function sendPayments(){
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations
    if(!dests) return
    if(!pod.id || !episode.id) return
    if(!pod.value.model) return
    const ts = getTS()
    const memo = JSON.stringify({
      feedID: pod.id,
      itemID: episode.id,
      ...ts && {ts},
    })
    feed.sendPayments(dests,memo,pricePerMinute)
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
  function onListen(e){
    //console.log(e)
  }
  function clickMsg(){
    if(ui.extraTextContent) {
      ui.setExtraTextContent(null)
      return
    }
    if(!pod.id || !episode.id) return
    ui.setExtraTextContent({
      feedID: pod.id,
      itemID: episode.id,
      title: episode.title,
      url: episode.enclosureUrl,
      ts: getTS(),
      type:'clip'
    })
  }

  return <PodPlayer>
    <MsgWrap>
      <Message style={{fontSize:20}} 
        onClick={clickMsg}
      />
    </MsgWrap>
    {episode && <AudioPlayer
      autoPlay={false}
      src={episode.enclosureUrl}
      onPlay={onPlay}
      onPause={onPause}
      onListen={onListen}
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
  position:relative;
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
const MsgWrap = styled.div`
  position:absolute;
  left:14px;
  top:48px;
  color:white;
  cursor:pointer;
  & svg {
    color:#809ab7;
  }
  &:hover svg{
    color:white;
  }
`

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}