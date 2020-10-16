import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import AudioPlayer from 'react-h5-audio-player';
import { useStores } from '../../../src/store'
import Message from '@material-ui/icons/Message'

export default function Player({pod,episode,sendPayments}){
  const { ui } = useStores()
  const ts = useRef(0)
  const secs = useRef(0)

  const NUM_SECONDS = 60
  function tick(){
    const s = secs.current
    if(s && s%NUM_SECONDS===0) {
      sendPayments(ts.current)
    }
    secs.current = secs.current + 1
  }
  function onPlay(){
    const dests = pod.value && pod.value.destinations
    if(!dests) return
  }
  function onListen(e){
    tick()
    ts.current = Math.round(e.target.currentTime)
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
      ts: ts.current,
      type:'clip'
    })
  }

  return <PodPlayer>
    {episode && <MsgWrap>
      <Message style={{fontSize:20}} onClick={clickMsg} />
    </MsgWrap>}
    {episode && <AudioPlayer
      autoPlay={false}
      src={episode.enclosureUrl}
      onPlay={onPlay}
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