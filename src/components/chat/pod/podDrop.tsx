import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Image, FlatList } from 'react-native'
import { useStores, useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import Controls from './controls'
import useInterval from '../../utils/useInterval'

export default function PodDrop({ show, host, uuid, url }) {
  const theme = useTheme()
  const { chats, feed } = useStores()
  const [pod, setPod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playing,setPlaying] = useState(false)
  const [list,setList] = useState(false)
  const [duration,setDuration] = useState(0)
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)

  function clickList(){
    setList(!list)
  }

  async function loadPod() {
    setLoading(true)
    const params = await chats.loadFeed(host, uuid, url)
    if (params) setPod(params)
    if (params) initialSelect(params)
    setLoading(false)
  }

  function onToggle(ts){
    if(playing) TrackPlayer.pause()
    else TrackPlayer.play()
    setPlaying(!playing)
  }

  async function addEpisodeToQueue(episode){
    await TrackPlayer.add({
      id: episode.id,
      url: episode.enclosureUrl,
      title: episode.title,
      artist: episode.author || 'author',
      artwork: episode.image
    });
  }

  async function selectEpisode(episode){
    TrackPlayer.reset()
    setDuration(0)
    setSelectedEpisodeID(episode.id)
    await addEpisodeToQueue(episode)
    await TrackPlayer.play();
    setPlaying(true)
    setList(false)

    setTimeout(async ()=>{
      const dur = await TrackPlayer.getDuration()
      setDuration(dur)
    },850)
  }

  async function initialSelect(ps){
    TrackPlayer.reset()
    const episode = ps && ps.episodes && ps.episodes.length && ps.episodes[0]
    if(!episode) return
    setSelectedEpisodeID(episode.id)
    await addEpisodeToQueue(episode)
    setTimeout(async ()=>{
      const dur = await TrackPlayer.getDuration()
      setDuration(dur)
    },850)
  }

  async function checkState(){
    const state = await TrackPlayer.getState()
    if(state===TrackPlayer.STATE_PAUSED || state===TrackPlayer.STATE_STOPPED) {
      setPlaying(false)
    }
    if(state===TrackPlayer.STATE_PLAYING) {
      setPlaying(true)
    }
  }

  function sendPayments(){
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations    
    if(!dests) return
    if(!pod.id || !selectedEpisodeID) return
    const memo = JSON.stringify({
      feedID: pod.id,
      itemID: selectedEpisodeID,
    })
    feed.sendPayments(dests, memo)    
  }

  const NUM_SECONDS=60
  const [count,setCount] = useState(0)
  useInterval(()=>{
    if(playing) {
      setCount(c=>{
        if(c%NUM_SECONDS===0) {
          sendPayments()
        }
        return c+1
      })
    }
  }, 1000)

  useEffect(() => {
    if (show){
      checkState()
      if(!pod) loadPod()
    }
    // if (!show) {
    //   TrackPlayer.stop()
    // }
  }, [show])

  if (!show) {
    return <></>
  }
  const height = 225
  const episode = selectedEpisodeID && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e=>e.id===selectedEpisodeID)

  const renderListItem: any = ({ item, index }) => {
    return <View style={{...styles.episode,borderBottomColor:theme.border}}>
      <IconButton icon="play" onPress={()=>selectEpisode(item)} />
      <Text style={{...styles.episodeTitle,color:theme.title}}>{item.title}</Text>
    </View>
  }

  return <View style={{ ...styles.wrap, backgroundColor: theme.bg, borderBottomColor: theme.border, height }}>
    {loading && <View style={{height, ...styles.spinWrap}}>
      <ActivityIndicator animating={true} color="#bbb" />
    </View>}

    <IconButton size={25} icon="menu" color={theme.title} style={styles.clickList}
      onPress={clickList}
    />

    {!loading && list && pod && pod.episodes && <View style={styles.listWrap}>
      <FlatList style={styles.list} data={pod.episodes} 
        renderItem={renderListItem}
      />
    </View>}

    {!loading && episode && !list && <View style={styles.inner}>
      <View style={styles.top}>
        {episode.image && <Image source={{ uri: episode.image }}
          style={{ width: 88, height: 88 }} resizeMode={'cover'}
        />}
        <View style={styles.info}>
          {pod.title && <Text style={{ color: theme.title, ...styles.podcastTitle }} numberOfLines={1}>
            {pod.title}
          </Text>}
          {episode.title && <Text style={{ color: theme.title, fontSize:13 }} numberOfLines={1}>
            {episode.title}
          </Text>}
        </View>
      </View>
      <View style={styles.track}>
        <Controls theme={theme} onToggle={onToggle} playing={playing} 
          duration={duration} episode={episode}
        />
      </View>
    </View>}
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    zIndex: 150,
    borderBottomWidth: 2
  },
  spinWrap:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
  },
  title: {
    color: 'white'
  },
  inner: {
    margin: 20,
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  info:{
    marginLeft:15,
    marginTop:20,
    display:'flex',
    flex:1,
    justifyContent:'space-around',
  },
  podcastTitle:{
    fontSize:15,
    marginBottom:8,
    maxWidth:'100%'
  },
  track: {
    width:'100%',
    height:32
  },
  listWrap:{
    display:'flex',
    flex:1
  },
  list:{
    display:'flex',
    flex:1
  },
  clickList:{
    position:'absolute',
    top:6,
    right:6,
    zIndex:150
  },
  episode:{
    height:45,
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    borderBottomWidth:1,
  },
  episodeTitle:{
    fontSize:14
  }
})

