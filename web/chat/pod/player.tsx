import React, { useRef, useEffect, useState } from 'react'
import AudioPlayer from './audioPlayer'
import { useStores } from '../../../src/store'
import { StreamPayment,NUM_SECONDS } from '../../../src/store/feed'
import * as Audio from './audio'
import EE, { EPISODE_SELECTED, INITIAL_TS } from '../../utils/ee'
import {useInterval} from './useInterval'

export default function Player({pod,episode,sendPayments,boost}){
  const { ui, user } = useStores()
  const secs = useRef(0)
  const [ts,setTS] = useState(0)
  const [duration,setDuration] = useState(0)
  const [playing,setPlaying] = useState(false)

  async function seekTo(t){
    if(!(t || t===0)) return
    setTS(t)
    await Audio.seekTo(t)
  }

  async function newEpisode(ep){
    const currentEpisodeID = await Audio.getCurrentTrack()
    if(currentEpisodeID!==ep.id) {
      const loaded = await Audio.add({
        id: ep.id,
        url: ep.enclosureUrl,
        title: ep.title,
        artist: ep.author || 'author',
        artwork: ep.image
      })
    } else {
      setPlaying(true) // same episode! keep it rollin
    }
    const dur = await Audio.getDuration()
    if(dur) setDuration(dur)
  }
  async function episodeSelected(ep){
    await Audio.reset() // clear them out baby
    await sleep(100)
    setTS(0)
    if(playing) setPlaying(false)
    // setTimeout(()=>{
    //   Audio.play(ep.id)
    //   setPlaying(true)
    // }, 500)
  }

  // FOR LOADING EPISODE VISUALS
  useEffect(()=>{
    if(episode) {
      newEpisode(episode)
    }
  },[episode])

  async function goInitialTS({ts,itemID}){
    if(episode.id===itemID) {
      setTS(ts) // only if NEW episode
    }
  }

  // JUST FOR PLAYING IT!
  useEffect(() => {
    EE.on(EPISODE_SELECTED, episodeSelected)
    EE.on(INITIAL_TS, goInitialTS)
    return () => {
      EE.removeListener(EPISODE_SELECTED, episodeSelected)
      EE.removeListener(INITIAL_TS, goInitialTS)
    }
  }, [playing])

  async function tick(){
    if(!playing) return
    const s = secs.current
    if(s && s%NUM_SECONDS===0) {
      sendPayments(ts)
    }
    secs.current = secs.current + 1
    const pos = await Audio.getPosition()
    if(pos) {
      setTS(pos)
    } else {
      setTS(current=>current+1)
    }    
  }
  async function actuallyPlay(){
    if(ts) {
      await Audio.seekTo(ts)
    }
    await Audio.play(episode.id)
  }
  async function playOrPauseAudio(){
    // check if its switched
    const eid = await Audio.getCurrentTrack()
    const isPlaying = await Audio.playing()
    if(isPlaying) {
      if(eid!==episode.id) {
        await Audio.stopAll() // stop the old one
        await actuallyPlay()
      } else {
        // same episode!
        await Audio.pause()
      }
    } else {
      actuallyPlay()
    }
  }
  async function onPlay(){
    playOrPauseAudio()
    setPlaying(c=>!c)
  }
  function onRewind() {
    seekTo(ts - 15)
  }
  function onForward() {
    seekTo(ts + 30)
  }
  useInterval(()=>{
    tick()
  }, 1000)

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
      ts: ts,
      type:'clip'
    }
    ui.setExtraTextContent(sp)
  }
  function clickBoost(){
    boost(ts)
  }

  function setRate(){
    Audio.setRate
  }

  const url = (episode && episode.enclosureUrl) || ''
  return <AudioPlayer url={url} playing={playing} 
    ts={ts} duration={duration} onSeek={seekTo}
    clickBoost={clickBoost} clickMsg={clickMsg}
    onPlay={onPlay} onRewind={onRewind} onForward={onForward}
  />
}


async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
