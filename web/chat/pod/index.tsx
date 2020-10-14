import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import { useStores } from '../../../src/store'
import CircularProgress from '@material-ui/core/CircularProgress';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Player from './player'
import Stats from './stats'

export default function Pod({ top, url, host, showPod, setShowPod }) {
  const [loading, setLoading] = useState(false)
  const [pod, setPod] = useState(null)
  const [showStats,setShowStats] = useState(false)
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null)
  const { chats, msg } = useStores()
  const scrollRef = useRef<HTMLDivElement>()

  async function loadPod() {
    console.log("LOAD POD", host, url)
    setLoading(true)
    const thepod = await chats.loadFeed(host, '', url)
    console.log("THE POD", thepod)
    if (thepod) {
      setPod(thepod)
      const episode = thepod.episodes && thepod.episodes.length && thepod.episodes[0]
      if (episode) setSelectedEpisodeId(episode.id)
    }
    setLoading(false)
  }

  function selectEpisode(e) {
    setSelectedEpisodeId(e.id)
    if (scrollRef && scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const previousFeedUrl = usePrevious(url)

  useEffect(() => {
    if (showPod && !selectedEpisodeId) loadPod()
  }, [showPod])
  const episode = selectedEpisodeId && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e => e.id === selectedEpisodeId)

  let earned = 0
  let incomingPayments = []
  if(pod && pod.id){
    incomingPayments = msg.filterMessagesByContent(0, `"feedID":${pod.id}`)
    if(incomingPayments) {
      earned = incomingPayments.reduce((acc,m)=>{
        if(m.sender!==1 && m.amount) {
          return acc + Number(m.amount)
        }
        return acc
      }, 0)
    }
    // console.log(earned)
  }

  let pricePerMinute = 0
  if(pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }

  if(pod && showStats) {
    return <PodWrap top={top} bg={theme.bg} show={showPod} ref={scrollRef}>
      <Stats pod={pod} onClose={()=>setShowStats(false)} 
        incomingPayments={incomingPayments} earned={earned}
      />
    </PodWrap>
  }

  return <PodWrap top={top} bg={theme.bg} show={showPod} ref={scrollRef}>
    {pod ? <PodInfo>
      <PodImage src={pod.image} alt={pod.title} />
      <PodText>
        <PodTitle>
          {pod.title}
        </PodTitle>
        {episode && <PodEpisode>
          {episode.title}
        </PodEpisode>}
        {(pricePerMinute?true:false) && <Price>
          {`Price per Minute: ${pricePerMinute} sats`}  
        </Price>}
      </PodText>
      {earned && <Earned onClick={()=>setShowStats(true)}>
        <div>Earned:</div>
        <div>{`${earned} sats`}</div>
      </Earned>}
    </PodInfo> : <Center><CircularProgress /></Center>}

    <Player pod={pod} episode={episode} pricePerMinute={pricePerMinute} />

    {pod && pod.episodes && <PodEpisodes>
      <span style={{ marginBottom: 3 }}>Episodes:</span>
      <EpisodeList>
        {pod.episodes.map((e, i) => {
          return <ListedEpisode onClick={() => selectEpisode(e)} key={i}>
            <PlayArrowIcon style={{ marginRight: 8, color: 'white', fontSize: 13 }} /> {e.title}
          </ListedEpisode>
        })}
      </EpisodeList>
    </PodEpisodes>}
  </PodWrap>
}

const PodWrap = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 2px 10px 1px rgba(0,0,0,0.95);
  padding: 13px;
  display: ${p => p.show ? 'block' : 'none'};
  width:360px;
  height:300px;
  background:black;
  position:absolute;
  right: 7px;
  top:${p => p.top + 7}px;
  background: ${p => p.bg};
  overflow-y: scroll;
`

const PodInfo = styled.div`
  display: flex;
  position:relative;
`
const Earned = styled.div`
  position:absolute;
  top:0px;
  right:0px;
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
  height: 75px;
  width: 75px;
`

const PodText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 12px;
  `

const PodTitle = styled.div`
  display: flex;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`

const PodEpisode = styled.div`
  display: flex;
  margin-top: 5px;
  font-size: 13px;
  color: #eee;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
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

`

const EpisodeList = styled.div`

`

const ListedEpisode = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
 border-top: solid 1px #809ab7;
 padding: 3px;
 color: #ddd;
&:hover{
  color: white;
  background: #141d27;
}
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