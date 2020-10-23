import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Image, FlatList } from 'react-native'
import { useStores, useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import Controls from './controls'
import useInterval from '../../utils/useInterval'
import EE, {CLIP_PAYMENT} from '../../utils/ee'
import {Destination,StreamPayment,NUM_SECONDS} from '../../../store/feed'

export default function PodDrop({ show, host, uuid, url }) {
  const theme = useTheme()
  const { chats, feed, user } = useStores()
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
    console.log("LOAD FEEED NOW")
    const params = await chats.loadFeed(host, uuid, url)
    if (params) setPod(params)
    if (params) initialSelect(params)
    setLoading(false)
  }

  function getAndSetDuration(){
    setTimeout(async ()=>{
      const dur = await TrackPlayer.getDuration()
      setDuration(dur)
    },850)
  }

  function onToggle(ts){
    if(playing) TrackPlayer.pause()
    else {
      TrackPlayer.play()
      if(!duration) getAndSetDuration()
    }
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
    getAndSetDuration()
  }

  async function initialSelect(ps){
    TrackPlayer.reset()
    const episode = ps && ps.episodes && ps.episodes.length && ps.episodes[0]
    if(!episode) return
    setSelectedEpisodeID(episode.id)
    await addEpisodeToQueue(episode)
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

  let pricePerMinute = 0
  if(pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }

  function sendPayments(ts:number){
    console.log('=> sendPayments!')
    const dests = pod && pod.value && pod.value.destinations    
    if(!dests) return
    if(!pod.id || !selectedEpisodeID) return
    const sp:StreamPayment = {
      feedID: pod.id,
      itemID: selectedEpisodeID,
      ts: ts||0
    }
    const memo = JSON.stringify(sp)
    feed.sendPayments(dests, memo, pricePerMinute)    
  }

  const [count,setCount] = useState(0)
  useInterval(()=>{
    if(playing) {
      setCount(c=>{
        if(c && c%NUM_SECONDS===0) {
          sendPayments(c)
        }
        return c+1
      })
    }
  }, 1000)

  useEffect(() => {
    if (show) checkState()
  }, [show])

  useEffect(()=>{
    if(url && !pod) loadPod()
  },[url])

  function onClipPayment(d){
    if(d.pubkey && d.ts) {
      const dests = pod && pod.value && pod.value.destinations    
      if(!dests) return
      const extraDest:Destination = {
        address: d.pubkey,
        split: 1,
        type: 'node'
      }
      const finalDests = dests.concat(extraDest)
      const sp:StreamPayment = {
        feedID: pod.id,
        itemID: selectedEpisodeID,
        ts: d.ts||0
      }
      if(d.uuid) sp.uuid = d.uuid
      const memo = JSON.stringify(sp)
      feed.sendPayments(finalDests, memo, pricePerMinute)
    }
  }

  useEffect(()=>{
    EE.on(CLIP_PAYMENT,onClipPayment)
    return ()=> {
      EE.removeListener(CLIP_PAYMENT,onClipPayment)
    }
  },[pod])

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
        keyExtractor={item=> item.id+''}
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
          {pricePerMinute && <Text style={{ color: theme.subtitle, fontSize:13, marginTop:6 }} numberOfLines={1}>
            {`Price per minute: ${pricePerMinute} sats`}  
          </Text>}
        </View>
      </View>
      <View style={styles.track}>
        <Controls theme={theme} onToggle={onToggle} playing={playing} 
          duration={duration} episode={episode} pod={pod}
          myPubkey={user.publicKey}
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
    marginTop:0,
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

