import React, { useRef, useLayoutEffect } from 'react'
import styled from 'styled-components'
import AudioPlayer from 'react-h5-audio-player';
import { useStores } from '../../../src/store'
import { StreamPayment,NUM_SECONDS } from '../../../src/store/feed'
import {ChatQuote, BoostIcon, Forward30, Back15} from './icons'

export default function Player({pod,episode,sendPayments,boost,initialTS}){
  const { ui, user } = useStores()
  const ts = useRef(0)
  const secs = useRef(0)

  const ref = useRef<any>()
  useLayoutEffect(()=>{
    if(initialTS) {
      if(ref&&ref.current&&ref.current.audio&&ref.current.audio.current) {
        ref.current.audio.current.currentTime = initialTS||0
      }
    }
  },[initialTS])

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
    const sp:StreamPayment = {
      feedID: pod.id,
      itemID: episode.id,
      title: episode.title,
      url: episode.enclosureUrl,
      pubkey: user.publicKey,
      ts: ts.current,
      type:'clip'
    }
    ui.setExtraTextContent(sp)
  }
  function clickBoost(){
    boost(ts.current)
  }

  return <PodPlayer>
    {episode && <MsgWrap>
      <ChatQuote style={{height:24,width:24}} onClick={clickMsg} />
    </MsgWrap>}
    {episode && <AudioPlayer
      ref={ref}
      autoPlay={false}
      src={episode.enclosureUrl}
      onPlay={onPlay}
      onListen={onListen}
      loop={false}
      customAdditionalControls={[]}
      customVolumeControls={[]}
      showDownloadProgress={false}
      showFilledProgress={false}
      progressJumpSteps={{
        backward:15,
        forward:30,
      }}
      customIcons={{
        rewind: <Back15 style={{fill:'#809ab7',marginRight:10,height:24,width:24}} />,
        forward: <Forward30 style={{fill:'#809ab7',marginLeft:10,height:24,width:24}} />
      }}
    />}
    {episode && <BoostWrap>
      <Boost style={{height:24,width:24}} onClick={clickBoost} />
    </BoostWrap>}
  </PodPlayer>
}

function Boost({onClick,style}){
  return <BoostGreen onClick={onClick} style={style||{}}>
    <BoostIcon style={{height:20,width:20}} />
  </BoostGreen>
}
const BoostGreen = styled.div`
  background:#48c998;
  height:24px;
  width:24px;
  border-radius:100%;
  display:flex;
  align-items:center;
  justify-content:center;
`

const PodPlayer = styled.div`
  display: flex;
  flex-direction: column;
  position:relative;
  & .rhap_container{
    background-color: #141d27;
  }
  & .rhap_controls-section{
    margin-top: 22px !important;
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
    position: absolute;
    top: 35px;
    left:20px;
  }
  & .rhap_time{
    color: #809ab7;
    font-size: 13px;
    position: absolute;
    top: 35px;
    right:20px;
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
  top:62px;
  color:white;
  cursor:pointer;
  & svg {
    color:#809ab7;
  }
  &:hover svg{
    color:white;
  }
`
const BoostWrap = styled.div`
  position:absolute;
  right:14px;
  top:62px;
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