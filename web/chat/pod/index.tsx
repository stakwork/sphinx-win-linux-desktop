import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import { useStores } from '../../../src/store'
import CircularProgress from '@material-ui/core/CircularProgress';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Player from './player'
import Stats from './stats'
import Replay from './replay'
import EE, { CLIP_PAYMENT, INITIAL_TS, EPISODE_SELECTED, PLAY_ANIMATION } from '../../utils/ee'
import { StreamPayment, Destination } from '../../../src/store/feed'
import Slider from '@material-ui/core/Slider';
import Alert from '@material-ui/lab/Alert';
import * as Audio from './audio'

export default function Pod({ url, chat, onBoost }) {
  const { chats, msg, feed, user, details } = useStores()
  const host = chat&&chat.host
  const chatID = chat&&chat.id
  const myid = user.myid

  const [loading, setLoading] = useState(false)
  const [pod, setPod] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)
  const [insfBalance, setInsfBalance] = useState(false)

  const [ppm,setPpm] = useState<number>(5)
  
  useEffect(()=>{
    if(chat) {
      let initppm = chats.pricesPerMinute[chatID]
      if(!(initppm||initppm===0)) initppm = chat.pricePerMinute||5
      if(initppm) setPpm(initppm)
    }
  }, [])

  const scrollRef = useRef<HTMLDivElement>()

  let pricePerMinute = 0
  if(chats.pricesPerMinute[chatID] || chats.pricesPerMinute[chatID]===0) {
    pricePerMinute = chats.pricesPerMinute[chatID]
  } else if(pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }

  async function loadPod() {
    setLoading(true)
    const thepod = await chats.loadFeed(host, '', url)
    if (thepod) {
      setPod(thepod)
      let isSet = false
      const isPlaying = await Audio.playing()
      if(!isPlaying && chat.meta && chat.meta.itemID) {
        if(chat.meta.ts) {
          setTimeout(()=>{
            EE.emit(INITIAL_TS,chat.meta)
          }, 1000)
        }
        if(chat.meta.sats_per_minute || chat.meta.sats_per_minute===0) {
          if(chat.meta.sats_per_minute!==ppm) {
            chats.setPricePerMinute(chatID,chat.meta.sats_per_minute)
            setPpm(chat.meta.sats_per_minute)
          }
        }
        const episode = thepod.episodes && thepod.episodes.length && thepod.episodes.find(e=>e.id===chat.meta.itemID)
        if (episode) {
          setSelectedEpisodeID(episode.id)
          isSet = true
        }
      }
      if(!isSet) {
        const eid = await Audio.getCurrentTrack()
        let episode
        if(isPlaying && eid) {
          episode = thepod.episodes && thepod.episodes.length && thepod.episodes.find(e=>e.id===eid)
        } 
        if(!episode) {
          episode = thepod.episodes && thepod.episodes.length && thepod.episodes[0]
        }
        if (episode) setSelectedEpisodeID(episode.id)
      }
    }
    setLoading(false)
  }

  function selectEpisode(e) {
    if(selectedEpisodeID===e.id) return
    setSelectedEpisodeID(e.id)
    if (scrollRef && scrollRef.current) scrollRef.current.scrollTop = 0
    EE.emit(EPISODE_SELECTED, e)
  }

  function boost(pos: number) {
    const amount = user.tipAmount || 100
    console.log("amount", amount)
    console.log("detail.balance", details.balance)
    if(amount>details.balance){
      console.log("not enough balance")
      setInsfBalance(true)
      setTimeout(() => {
        setInsfBalance(false)
      }, 3500);
      return
    }
    EE.emit(PLAY_ANIMATION)
    const sp: StreamPayment = {
      feedID: pod.id,
      itemID: selectedEpisodeID,
      ts: Math.round(pos) || 0,
      amount,
    }
    onBoost(sp)
    const dests = pod && pod.value && pod.value.destinations
    if (!dests) return
    if (!pod.id || !selectedEpisodeID) return
    const memo = JSON.stringify(sp)
    feed.sendPayments(dests, memo, amount, chatID, false)
  }

  async function sendPayments(ts: number) {
    console.log('=> sendPayments!')

    const current = Audio.getCurrent()
    if(!current) return
    const item = current.item
    if(!item) return
    const dests = item.dests
    if (!dests) return

    const pos = await Audio.getPosition()

    const sp: StreamPayment = {
      feedID: item.feedID,
      itemID: item.id,
      ts: Math.round(pos),
    }
    const memo = JSON.stringify(sp)
    feed.sendPayments(dests, memo, item.price || pricePerMinute, item.chatID || chatID, true)
  }

  function onClipPayment(d) {
    if (d.pubkey && d.ts) {
      const extraDest: Destination = {
        address: d.pubkey,
        split: 1,
        type: 'node'
      }
      const dests = pod && pod.value && pod.value.destinations
      const sp: StreamPayment = {
        feedID: d.feedID,
        itemID: d.itemID,
        ts: d.ts || 0,
      }
      if (d.uuid) sp.uuid = d.uuid
      const memo = JSON.stringify(sp)
      const finalDests: Destination[] = dests.concat(extraDest)
      feed.sendPayments(finalDests, memo, pricePerMinute, chatID, false)
    }
  }

  useEffect(() => {
    EE.on(CLIP_PAYMENT, onClipPayment)
    return () => {
      EE.removeListener(CLIP_PAYMENT, onClipPayment)
    }
  }, [pod]) // reset listener on pod change

  function newFeedURL(){
    if(url) {
      loadPod()
    } else {
      setPod(null)
      setSelectedEpisodeID(null)
    }
  }

  const previousFeedURL = usePrevious(url)
  useEffect(() => {
    if(previousFeedURL!==url) {
      newFeedURL()
    }
  }, [url,chatID])

  const episode = selectedEpisodeID && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e => e.id === selectedEpisodeID)

  let earned = 0
  let incomingPayments = []
  if (pod && pod.id) {
    incomingPayments = msg.filterMessagesByContent(0, `"feedID":${pod.id}`)
    if (incomingPayments) {
      earned = incomingPayments.reduce((acc, m) => {
        if (m.sender !== myid && m.amount) {
          return acc + Number(m.amount)
        }
        return acc
      }, 0)
    }
    // console.log(earned)
  }

  if (pod && showStats) {
    return <PodWrap bg={theme.bg} ref={scrollRef} style={{ padding: 16 }}>
      <Stats pod={pod} onClose={() => setShowStats(false)}
        incomingPayments={incomingPayments} earned={earned}
      />
    </PodWrap>
  }

  const ppms = [0,3,5,10,20,50,100]
  function chooseSatsPerMinute(e, n){
    if(!chatID) return
    const price = ppms[n] || 0
    chats.setPricePerMinute(chatID,price)
  }
  function satsPerMinuteChanged(e,v){
    setPpm(ppms[v]||0)
  }
  let sliderValue = ppms.indexOf(ppm)
  if(sliderValue<0) sliderValue=2

  function valueLabelFormat(v){
    return `${ppms[v]}`
  }

  return <PodWrap bg={theme.bg} ref={scrollRef} hide={!chatID||!url}>
      {pod && <PodImage src={pod.image} alt={pod.title} />}
      {chat && episode && <Replay chat={chat} episode={episode}/> }

    

    {(earned ? true : false) && <Earned onClick={() => setShowStats(true)}>
      <div>Earned:</div>
      <div>{`${earned} sats`}</div>
    </Earned>}

    {pod && <SliderWrap>
      <SliderText>
        <span>Podcast: price to minute</span>
        <span>{`${ppms[sliderValue]}`}</span>
      </SliderText>
      <Slider
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        onChangeCommitted={chooseSatsPerMinute}
        aria-labelledby="value-slider"
        valueLabelDisplay="auto"
        step={1}
        min={0}
        max={6}
        value={sliderValue}
        onChange={satsPerMinuteChanged}
      />
    </SliderWrap>}

    {pod ? <PodInfo>
      <PodText>
        {episode && <PodEpisode>
          {episode.title}
        </PodEpisode>}
        {/* {(pricePerMinute?true:false) && <Price>
          {`Price per Minute: ${pricePerMinute} sats`}  
        </Price>} */}
      </PodText>
    </PodInfo> : <Center><CircularProgress /></Center>}

     {insfBalance && <Alert style={{ position: 'absolute', bottom: "43%", left: 'calc(50% - 80px)', opacity: 0.9 }} icon={false}>Insufficient Balance</Alert>}

     <Player pod={pod} episode={episode}
      sendPayments={sendPayments} boost={boost} chat={chat} ppm={ppm}
    />

    {pod && pod.episodes && <PodEpisodes>
      <div style={{ marginBottom: 5 }}>{`Episodes: ${pod.episodes.length}`}</div>
      <EpisodeList>
        {pod.episodes.map((e, i) => {
          const selected = e.id === selectedEpisodeID
          return <ListedEpisode onClick={() => selectEpisode(e)} key={i}>
            {selected && <PlayArrowIcon style={{ position: 'absolute', left: -16, top: 13, fontSize: 15 }} />}
            <EpisodeImg src={e.image || pod.image} />
            <span>{e.title}</span>
          </ListedEpisode>
        })}
      </EpisodeList>
    </PodEpisodes>}
  </PodWrap>
}

const PodWrap = styled.div`
  display: ${p=>p.hide?'none':'flex'};
  flex-direction: column;
  box-shadow: 0px 2px 10px 1px rgba(0,0,0,0.95);
  width:302px;
  height:100%;
  background:black;
  background: ${p => p.bg};
  overflow-y: overlay;
  border-left:2px solid #3a4754;
  z-index:999;
  position:relative;
  &::-webkit-scrollbar-track {background: transparent;}
  &::-webkit-scrollbar {display: none;}
`

const PodInfo = styled.div`
  display: flex;
  position:relative;
  flex-direction:column;
  padding:18px;
`
const Earned = styled.div`
  position:absolute;
  top:5px;
  right:5px;
  border:1px solid #809ab7;
  background:black;
  color:#809ab7;
  border-radius:4px;
  padding: 5px 8px;
  font-size: 11px;
  cursor:pointer;
  &:hover{
    color:white;
    border-color:white;
  }
`
const PodImage = styled.img`
  display: flex;
  height: 300px;
  width: 300px;
`

const PodText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 12px;
  `

const PodTitle = styled.div`
  font-size:48px;
  display: flex;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`

const PodEpisode = styled.div`
  display: flex;
  margin-top: 15px;
  font-size: 22px;
  color: #eee;
  max-width: calc(100% - 26px);
  margin:0 auto;
  text-align:center;
`
const Price = styled.div`
  display: flex;
  margin-top: 8px;
  font-size: 13px;
  color: #809ab7;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`
const PodEpisodes = styled.div`
  padding:20px;
`

const EpisodeList = styled.div`

`

const ListedEpisode = styled.div`
  display: flex;
  align-items: center;
  position:relative;
  cursor: pointer;
  padding: 3px;
  color: #ddd;
  &:hover{
    color: white;
    background: #141d27;
  }
  & span {
    white-space: nowrap;
    max-width: 100%;
    text-overflow: ellipsis;
    display: block;
    overflow: hidden;
    font-size: 13px;
  }
  margin:4px 0;
`
const EpisodeImg = styled.div`
  width:32px;
  height:32px;
  min-width:32px;
  min-height:32px;
  background-image:url(${p => p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  margin-right:10px;
`
const Center = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

const SliderWrap = styled.div`
  margin:20px 20px 0 20px;
  display:flex;
  flex-direction:column;
  align-items:center;
`
const SliderText = styled.div`
  display:flex;
  width:100%;
  flex-direction:row;
  align-items:center;
  justify-content:space-between;
  & span {
    font-size:12px;
  }
`

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
