import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Image, Dimensions, ScrollView } from 'react-native'
import { useStores, useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import Controls from './controls'
import useInterval from '../../utils/useInterval'
import EE, {CLIP_PAYMENT} from '../../utils/ee'
import {Destination,StreamPayment,NUM_SECONDS} from '../../../store/feed'
import PodBar from './podBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image'
import Boost from './boost'

export default function Pod({ show, host, uuid, url }) {
  const theme = useTheme()
  const { chats, feed, user } = useStores()
  const [pod, setPod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playing,setPlaying] = useState(false)
  // const [list,setList] = useState(false)
  const [duration,setDuration] = useState(0)
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)
  const [full, setFull] = useState(false)

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

  function onToggle(){
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
    getAndSetDuration()
  }

  async function initialSelect(ps){
    TrackPlayer.reset()
    const episode = ps && ps.episodes && ps.episodes.length && ps.episodes[0]
    if(!episode) return
    setSelectedEpisodeID(episode.id)
    await addEpisodeToQueue(episode)
    if(!duration) getAndSetDuration()
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

  const episode = selectedEpisodeID && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e=>e.id===selectedEpisodeID)

  if (!show || !episode) {
    return <></>
  }

  if(!full) {
    return <PodBar pod={pod} episode={episode} 
      onToggle={onToggle} playing={playing}
      onShowFull={()=>setFull(true)}
    />
  }

  const renderListItem: any = ({ item, index, selected }) => {
    return <TouchableOpacity key={index} style={{...styles.episode,borderBottomColor:theme.border,backgroundColor:selected?theme.deep:theme.bg}}
      onPress={()=>selectEpisode(item)}>
      {/* <IconButton icon="play" onPress={()=>selectEpisode(item)} /> */}
      <Icon name="play" color={theme.subtitle} size={16} style={{opacity:playing&&selected?1:0}} />
      <FastImage source={{ uri: item.image }}
        style={{ width: 42, height: 42, marginLeft:8, marginRight:12 }} resizeMode={'cover'}
      />
      <Text style={{...styles.episodeTitle,color:theme.title}}>{item.title}</Text>
    </TouchableOpacity>
  }

  const width = Math.round(Dimensions.get('window').width)
  return <View style={{ ...styles.wrap, backgroundColor: theme.bg, borderBottomColor: theme.border }}>
    {loading && <View style={{...styles.spinWrap}}>
      <ActivityIndicator animating={true} color="#bbb" />
    </View>}

    {/* <IconButton size={25} icon="menu" color={theme.title} style={styles.clickList}
      onPress={clickList}
    /> */}

    {!loading && episode && <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      
      <IconButton size={32} icon="chevron-down" color={theme.title} style={styles.closeFull}
        onPress={()=>setFull(false)}
      />

      <Boost onPress={()=>{}} style={{position:'absolute',right:32,top:width-91,zIndex:200}} />

      {pod.image && <View style={{...styles.imgWrap,width,height:width-34}}>
        <FastImage source={{ uri: episode.image }}
          style={{ width: width-78, height: width-78, marginLeft:39, marginTop:25, borderRadius:19 }} resizeMode={'cover'}
        />
      </View>}
      <View style={styles.top}>
        {episode.title && <Text style={{ color: theme.title, fontSize:18 }} numberOfLines={1}>
          {episode.title}
        </Text>}
        {/* <View style={styles.info}>
          {pod.title && <Text style={{ color: theme.title, ...styles.podcastTitle }} numberOfLines={1}>
            {pod.title}
          </Text>}
          {episode.title && <Text style={{ color: theme.title, fontSize:13 }} numberOfLines={1}>
            {episode.title}
          </Text>}
          {pricePerMinute && <Text style={{ color: theme.subtitle, fontSize:13, marginTop:6 }} numberOfLines={1}>
            {`Price per minute: ${pricePerMinute} sats`}  
          </Text>}
        </View> */}

      </View>
      <View style={styles.track}>
        <Controls theme={theme} onToggle={onToggle} playing={playing} 
          duration={duration} episode={episode} pod={pod}
          myPubkey={user.publicKey}
        />
      </View>
      {(pod.episodes?true:false) && <View style={styles.listWrap}>
        <View style={{...styles.episodesLabel,borderBottomColor:theme.border}}>
          <Text style={{color:theme.subtitle,fontSize:12,fontWeight:'bold'}}>EPISODES</Text>
          <Text style={{color:theme.subtitle,opacity:0.85,fontSize:12,marginLeft:10}}>{pod.episodes.length}</Text>
        </View>
        <ItemList style={styles.list} data={pod.episodes} 
          renderItem={renderListItem} selectedEpisodeID={selectedEpisodeID}
        />
      </View>}
    </ScrollView>}
  </View>
}

function ItemList({data, renderItem, style, selectedEpisodeID}){
  return <View style={style}>
    {data&&data.map((item,index)=>{
      const selected = selectedEpisodeID===item.id
      return renderItem({item,index,selected})
    })}
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    maxWidth: '100%',
    minWidth:'100%',
    zIndex: 150,
    top:50,
    flex:1,
    display:'flex',
    backgroundColor:'black',
    height:'100%'
  },
  imgWrap:{
    width:'100%'
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
  scroll: {
    margin: 4,
    flex:1,
    display:'flex',
    maxHeight:'90%',
    overflow:'scroll',
  },
  inner: {
    margin: 4,
    display:'flex',
    position:'relative',
    alignItems:'center'
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
    width:'90%',
    height:128,
  },
  listWrap:{
    display:'flex',
    flex:1,
    width:'100%'
  },
  list:{
    display:'flex',
    flex:1
  },
  closeFull:{
    position:'absolute',
    top:8,
    left:0,
    zIndex:150
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
    position:'relative'
  },
  episodeTitle:{
    fontSize:14
  },
  episodesLabel:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    width:'100%',
    borderBottomWidth:2,
    padding:4,
    marginTop:8,marginBottom:6
  }
})

