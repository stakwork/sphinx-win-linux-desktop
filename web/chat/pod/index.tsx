import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import { useStores } from '../../../src/store'
import CircularProgress from '@material-ui/core/CircularProgress';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Player from './player'

export default function Pod({ top, url, host, showPod, setShowPod }) {
  const [loading, setLoading] = useState(false)
  const [pod, setPod] = useState(null)
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null)
  const { chats } = useStores()
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

  return <PodWrap top={top} bg={theme.bg} show={showPod} ref={scrollRef}>
    {pod ? <PodInfo>
      <PodImage src={pod.image} alt={pod.title} />
      <PodText>
        <PodTitle>
          {pod.title}
        </PodTitle>
        {episode && <PodEpisode>
          {episode.title}
        </PodEpisode>
        }
      </PodText>
    </PodInfo> : <Center><CircularProgress /></Center>}
    <Player pod={pod} episode={episode} />
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
  box-shadow: 0px 2px 10px 1px rgba(0,0,0,0.75);
  padding: 13px;
  display: ${p => p.show ? 'block' : 'none'};
  width:350px;
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