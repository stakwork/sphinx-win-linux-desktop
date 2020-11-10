import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import { useStores } from '../../../src/store'
import CircularProgress from '@material-ui/core/CircularProgress';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Player from './player'
import Stats from './stats'
import EE, { CLIP_PAYMENT, PLAY_ANIMATION } from '../../utils/ee'
import { StreamPayment, Destination } from '../../../src/store/feed'

export default function Pod({ url, host, onBoost }) {
  const [loading, setLoading] = useState(false)
  const [pod, setPod] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)
  const { chats, msg, feed } = useStores()
  const scrollRef = useRef<HTMLDivElement>()

  async function loadPod() {
    // console.log("LOAD POD", host, url)
    setLoading(true)
    const thepod = await chats.loadFeed(host, '', url)
    console.log("THE POD", thepod)
    if (thepod) {
      setPod(thepod)
      const episode = thepod.episodes && thepod.episodes.length && thepod.episodes[0]
      if (episode) setSelectedEpisodeID(episode.id)
    }
    setLoading(false)
  }

  function selectEpisode(e) {
    setSelectedEpisodeID(e.id)
    if (scrollRef && scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const previousFeedUrl = usePrevious(url)

  function boost(pos: number) {
    console.log("BOOST")
    EE.emit(PLAY_ANIMATION)
    return
    const amount = 100
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
    feed.sendPayments(dests, memo, amount)

  }

  function sendPayments(ts: number) {
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations
    console.log(dests, pod)
    if (!dests) return
    if (!pod || !episode)
      if (!pod.id || !episode.id) return
    if (!pod.value.model) return
    const sp: StreamPayment = {
      feedID: pod.id,
      itemID: episode.id,
      ts: ts || 0,
    }
    const memo = JSON.stringify(sp)
    feed.sendPayments(dests, memo, pricePerMinute)
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
      feed.sendPayments(finalDests, memo, pricePerMinute)
    }
  }

  useEffect(() => {
    EE.on(CLIP_PAYMENT, onClipPayment)
    return () => {
      EE.removeListener(CLIP_PAYMENT, onClipPayment)
    }
  }, [pod]) // reset listener on pod change

  useEffect(() => {
    if (url && !pod) {
      loadPod()
    }
  }, [url])

  useEffect(() => {
    if (!selectedEpisodeID) loadPod()
  }, [])
  const episode = selectedEpisodeID && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e => e.id === selectedEpisodeID)

  let earned = 0
  let incomingPayments = []
  if (pod && pod.id) {
    incomingPayments = msg.filterMessagesByContent(0, `"feedID":${pod.id}`)
    if (incomingPayments) {
      earned = incomingPayments.reduce((acc, m) => {
        if (m.sender !== 1 && m.amount) {
          return acc + Number(m.amount)
        }
        return acc
      }, 0)
    }
    // console.log(earned)
  }

  let pricePerMinute = 0
  if (pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }

  if (pod && showStats) {
    return <PodWrap bg={theme.bg} ref={scrollRef} style={{ padding: 16 }}>
      <Stats pod={pod} onClose={() => setShowStats(false)}
        incomingPayments={incomingPayments} earned={earned}
      />
    </PodWrap>
  }

  return <PodWrap bg={theme.bg} ref={scrollRef}>
    {pod && <PodImage src={pod.image} alt={pod.title} />}

    {(earned ? true : false) && <Earned onClick={() => setShowStats(true)}>
      <div>Earned:</div>
      <div>{`${earned} sats`}</div>
    </Earned>}

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

    <Player pod={pod} episode={episode}
      sendPayments={sendPayments}
      boost={boost}
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
  display: flex;
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
