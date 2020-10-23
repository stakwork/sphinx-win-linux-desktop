import React, {useEffect,useLayoutEffect,useRef} from 'react'
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import theme from '../../theme'
import styled from 'styled-components'
import EE, {CLIP_PAYMENT} from '../../utils/ee'
import {StreamPayment,NUM_SECONDS} from '../../../src/store/feed'

export default function Clip(props){
  const {feedID, itemID, ts, title, text, url, pubkey, isMe, uuid} = props
  const ref = useRef<any>()
  useLayoutEffect(()=>{
    if(ref&&ref.current&&ref.current.audio&&ref.current.audio.current) {
      ref.current.audio.current.currentTime = ts||0
    }
  },[])

  const timestamp = useRef(0)
  const secs = useRef(0)
  function tick(){
    const s = secs.current
    if(s && s%NUM_SECONDS===0) {
      const sp:StreamPayment = {
        feedID, itemID, pubkey, ts:Math.round(timestamp.current), uuid
      }
      console.log(sp)
      EE.emit(CLIP_PAYMENT,sp)
    }
    secs.current = secs.current + 1
  }
  function onListen(e){
    tick()
    timestamp.current = e.target.currentTime
  }

  if(!url) {
    return <Pad>{text}</Pad>
  }
  return <PodPlayer style={{width:300}} bg={isMe ? theme.highlight : theme.extraDeep}>
    {title && <TitleWrap><Title>{title}</Title></TitleWrap>}
    <AudioPlayer ref={ref}
      autoPlay={false}
      layout="horizontal-reverse"
      src={url}
      customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
      onListen={onListen}
    />
    <Text>{text}</Text>
  </PodPlayer>
}
const TitleWrap = styled.div`
  position:relative;
  height:20px;
`
const Title = styled.div`
  position:absolute;
  color:white;
  font-size:12px;
  left:16px;
  top:12px;
`
const Pad = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
`
const Text = styled.div`
  padding:0 16px 16px 16px;
  max-width:440px;
  word-break: break-word;
`
const PodPlayer = styled.div`
  display: flex;
  flex-direction: column;
  position:relative;
  & .rhap_container{
    background-color:${p=>p.bg};
  }
  & .rhap_main-controls-button{
    color: white;
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
    color: white;
    font-size: 13px;
  }
  & .rhap_time{
    color: white;
    font-size: 13px;
  }
  & .rhap_volume-indicator{
    background: #809ab7;
  }
  & .rhap_volume-button{
    color: white;
  }
  & .rhap_rewind-button{
    display:none;
  }
  & .rhap_forward-button{
    display:none;
  }
  & .rhap_controls-section{
    max-width:50px;
  }
`