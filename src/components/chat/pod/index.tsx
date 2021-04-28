import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, AppState, Dimensions, ScrollView, ToastAndroid } from 'react-native'
import { useStores, useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import Controls from './controls'
import useInterval from '../../utils/useInterval'
import EE, { CLIP_PAYMENT, PLAY_ANIMATION } from '../../utils/ee'
import { Destination, StreamPayment, NUM_SECONDS, SendPaymentArgs } from '../../../store/feed'
import PodBar from './podBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image'
import Replay from './replay'
import { getPosition, setPosition } from './position'
import * as interval from '../../interval'
import {
  useTrackPlayerProgress,
  useTrackPlayerEvents,
} from "react-native-track-player/lib/hooks"
import {TrackPlayerEvents, STATE_PLAYING} from 'react-native-track-player';

export default function Pod({ pod, show, chat, onBoost, podError }) {
  const theme = useTheme()
  const chatID = chat.id
  const { feed, user, msg, chats, details } = useStores()
  const myid = user.myid

  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  // const [list,setList] = useState(false)
  const [duration, setDuration] = useState(0)
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)
  const [full, setFull] = useState(false)
  const [queuedTrackID, setQueuedTrackID] = useState(null)
  const [speed, setSpeed] = useState('1')
  const [currentlyPlayingPod, setCurrentlyPlayingPod] = useState(null)

  const episode = selectedEpisodeID && pod && pod.episodes && pod.episodes.length && pod.episodes.find(e => e.id === selectedEpisodeID)

  function getAndSetDuration() {
    setTimeout(async () => {
      const dur = await TrackPlayer.getDuration()
      setDuration(dur)
    }, 850)
  }

  async function onToggle() {

    const trackID = await TrackPlayer.getCurrentTrack()

    if(trackID && parseInt(trackID)!==selectedEpisodeID) {
      // console.log("RESET HERE FOR TRACK")
      await TrackPlayer.reset()
      await addEpisodeToQueue(episode)
    }
    if (playing && trackID && parseInt(trackID)===selectedEpisodeID) {
      TrackPlayer.pause()
      // setCurrentlyPlayingPod(null)
      interval.pause()
    }
    else if (playing && trackID && parseInt(trackID)!==selectedEpisodeID){
      // console.log("PLAY NEW!")
      selectEpisode(episode)
      setCurrentlyPlayingPod(pod)
      const args = await makeSendPaymentArgs(pod)
      interval.setArgs(args)
    }
    else {
      // console.log("PLAY!")
      TrackPlayer.play()
      setCurrentlyPlayingPod(pod)
      getAndSetDuration()
      const args = await makeSendPaymentArgs(pod)
      interval.setArgs(args)

    }
    setPlaying(!playing)
  }

  async function addEpisodeToQueue(episode) {
    // console.log("ADDING! = ", episode.title)
    await TrackPlayer.add({
      id: episode.id,
      url: episode.enclosureUrl,
      title: episode.title,
      artist: episode.author || 'author',
      artwork: episode.image
    });
  }

  async function selectEpisode(episode) {
    TrackPlayer.reset()
    setDuration(0)
    setSelectedEpisodeID(episode.id)
    await addEpisodeToQueue(episode)
    await TrackPlayer.play();
    const args = await makeSendPaymentArgs()
    interval.setArgs(args)
    setPlaying(true)
    getAndSetDuration()
  }

  function setRate(r: string) {
    TrackPlayer.setRate(parseFloat(r))
    setSpeed(r)
  }

  function setDefaultRate() {
    TrackPlayer.setRate(1)
  }


  useTrackPlayerEvents([TrackPlayerEvents.PLAYBACK_STATE], async event => {
    console.log("EVENT === ", event)
      if (event.state === TrackPlayer.STATE_STOPPED) {
      console.log("STOPPING")
      interval.pause();
      TrackPlayer.pause()
      setPlaying(false)
      await TrackPlayer.seekTo(0);
      setPosition()
    }
  });

  async function initialSelect(ps) {    
      console.log("PLaying? ", playing)
      // console.log("IM INITIAL SELECTING!")
      let theID = queuedTrackID
      if (chat.meta && chat.meta.itemID) {
        theID = chat.meta.itemID
      }
      if(playing){
        theID = await TrackPlayer.getCurrentTrack()
      }
      let episode = ps && ps.episodes && ps.episodes.length && ps.episodes[0]
      if (theID) {
        const qe = ps && ps.episodes && ps.episodes.length && ps.episodes.find(e => e.id == theID)
        if (qe) episode = qe
        else {
          if(!playing){
            // console.log("INITIAL RESETTING")
            TrackPlayer.reset()
          }
        }
      }

    if (!episode) return
    
    setSelectedEpisodeID(episode.id)
    setCurrentlyPlayingPod(ps)

    await addEpisodeToQueue(episode)
    if (!duration) getAndSetDuration()

    // if its the same, dont seek
    if (!playing && queuedTrackID && parseInt(queuedTrackID) !== episode.id) {
      const ts = chat.meta && chat.meta.ts
      if (!playing && ts || ts === 0) {
        await TrackPlayer.seekTo(ts);
        setPosition()
      }
    }

    const spm = chat.meta && chat.meta.sats_per_minute
    if (spm || spm === 0) {
      chats.setPricePerMinute(chatID, spm)
    }

    const spee = chat.meta && chat.meta.speed
    if (spee) {
      setRate(spee)
    } else {
      setDefaultRate()
    }
  }

  async function checkState() {
    const state = await TrackPlayer.getState()
    // console.log(state)
    if (state === TrackPlayer.STATE_PAUSED || state === TrackPlayer.STATE_STOPPED) {
      setPlaying(false)
    }
    if (state === TrackPlayer.STATE_PLAYING) {
      setPlaying(true)
      const trackID = await TrackPlayer.getCurrentTrack()
      if (trackID) {
        setQueuedTrackID(trackID)
      }
    }
  }

  let pricePerMinute = 0
  if (chats.pricesPerMinute[chatID] || chats.pricesPerMinute[chatID] === 0) {
    pricePerMinute = chats.pricesPerMinute[chatID]
  } else if (pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }

  async function makeSendPaymentArgs(cpp?, multiplier?: number): Promise<SendPaymentArgs> {
    const mult = multiplier || 1
      const thePod = cpp || currentlyPlayingPod
      if (!pricePerMinute) return
      // console.log('=> sendArgs!')
      const pos = await TrackPlayer.getPosition()
      const dests = thePod && thePod.value && thePod.value.destinations
      const trackID = await TrackPlayer.getCurrentTrack()
      if (!dests) return
      if (!thePod.id || !trackID) return
      // console.log("Episode Sent === ", trackID)
      const sp: StreamPayment = {
        feedID: thePod.id,
        itemID: parseInt(trackID),
        ts: Math.round(pos) || 0,
        speed: speed,
      }
      const memo = JSON.stringify(sp)
      console.log("PPM === ", pricePerMinute)
      console.log("MULT === ", mult)
      return {
        destinations: dests,
        text: memo,
        amount: (pricePerMinute * mult || 1),
        chat_id: chatID,
        update_meta: true
      }

  }

  useEffect(()=>{
    interval.setNumSeconds(NUM_SECONDS)
  }, [])

  const count = useRef(0)
  const storedTime = useRef(0)
  useInterval(async() => {
    if(playing) setPosition()
  }, 1000)

  const appState = useRef(AppState.currentState);
  async function handleAppStateChange(nextAppState) {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      const now = Math.round(Date.now().valueOf() / 1000)
      const gap = now - storedTime.current
      if (gap > 0) {
        const n = Math.floor(gap / NUM_SECONDS)
        if (n) {
          try{
            const fetchedArgs = interval.getArgs()
            const newText = JSON.parse(fetchedArgs.text)
            const pos = await TrackPlayer.getPosition()
            newText.ts = Math.round(pos)
            console.log("STATE CHANGE")
            feed.sendPayments({
              destinations: fetchedArgs.destinations,
              text: JSON.stringify(newText),
              amount: (fetchedArgs.amount * n),
              chat_id: fetchedArgs.chat_id,
              update_meta: fetchedArgs.update_meta
            })
          } catch(e){}
        }
      }
    }
    if (appState.current.match(/active/) && nextAppState === "background") {
      storedTime.current = Math.round(Date.now().valueOf() / 1000)
    }
    appState.current = nextAppState;
  }
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    }
  }, [])

  useEffect(() => {
    if (show) checkState()
  }, [show])

  useEffect(() => {
    if (pod) initialSelect(pod)
  }, [pod])

  function onClipPayment(d) {
    if (pricePerMinute && d.pubkey && d.ts) {
      const dests = pod && pod.value && pod.value.destinations
      if (!dests) return
      const extraDest: Destination = {
        address: d.pubkey,
        split: 1,
        type: 'node'
      }
      const finalDests = dests.concat(extraDest)
      const sp: StreamPayment = {
        feedID: pod.id,
        itemID: selectedEpisodeID,
        ts: d.ts || 0
      }
      if (d.uuid) sp.uuid = d.uuid
      const memo = JSON.stringify(sp)
      console.log("CLIP PAYMENT")
      feed.sendPayments({destinations: finalDests, text: memo, amount: pricePerMinute, chat_id: chatID, update_meta:false})
    }
  }

  useEffect(() => {
    EE.on(CLIP_PAYMENT, onClipPayment)
    return () => {
      EE.removeListener(CLIP_PAYMENT, onClipPayment)
    }
  }, [pod])


  const replayMsgs = useRef([])
  function closeFull() {
    replayMsgs.current = [] // close out
    setFull(false)
  }
  function openFull() {
    if (!chatID) return
    const msgs = msg.messages[chatID] || []
    const msgsForEpisode = msgs.filter(m => m.message_content && m.message_content.includes('::') && m.message_content.includes(episode.id))
    const msgsforReplay = []
    msgsForEpisode.forEach(m => {
      const arr = m.message_content.split('::')
      if (arr.length < 2) return
      try {
        const dat = JSON.parse(arr[1])
        if (dat) msgsforReplay.push({
          ...dat,
          type: arr[0],
          alias: m.sender_alias || (m.sender === myid ? user.alias : ''),
          date: m.date,
        })
      } catch (e) { }
    })
    replayMsgs.current = msgsforReplay
    setFull(true)
  }

  if (!show) {
    return <></>
  }

  if (!episode) {
    return <PodBar episode={episode}
      onToggle={onToggle} playing={playing}
      onShowFull={openFull} boost={boost}
      duration={duration} loading={true}
      podError={podError}
    />
  }

  function boost() {
    
    const amount = user.tipAmount || 100

    if(amount>details.balance){
      ToastAndroid.showWithGravityAndOffset(
        'Not Enough Balance',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        0, 125
      );
      return
    }

    EE.emit(PLAY_ANIMATION)
    requestAnimationFrame(async () => {
      const pos = getPosition()
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
      feed.sendPayments({destinations: dests, text: memo, amount: amount, chat_id: chatID, update_meta: false})
    })
  }

  if (!full) {
    return <PodBar episode={episode}
      onToggle={onToggle} playing={playing}
      onShowFull={openFull} boost={boost}
      duration={duration} loading={false} podError={''}
    />
  }

  const renderListItem: any = ({ item, index, selected, fallbackImage }) => {
    return <TouchableOpacity key={index} style={{ ...styles.episode, borderBottomColor: theme.border, backgroundColor: selected ? theme.deep : theme.bg }}
      onPress={() => selectEpisode(item)}>
      {/* <IconButton icon="play" onPress={()=>selectEpisode(item)} /> */}
      <Icon name="play" color={theme.subtitle} size={16} style={{ opacity: selected ? 1 : 0 }} />
      <FastImage source={{ uri: item.image || fallbackImage }}
        style={{ width: 42, height: 42, marginLeft: 8, marginRight: 12 }} resizeMode={'cover'}
      />
      <Text style={{ ...styles.episodeTitle, color: theme.title }}>{item.title}</Text>
    </TouchableOpacity>
  }

  const width = Math.round(Dimensions.get('window').width)
  return <View style={{ ...styles.wrap, backgroundColor: theme.bg, borderBottomColor: theme.border }}>
    {loading && <View style={{ ...styles.spinWrap }}>
      <ActivityIndicator animating={true} color="#bbb" />
    </View>}

    {/* <IconButton size={25} icon="menu" color={theme.title} style={styles.clickList}
      onPress={clickList}
    /> */}

    {!loading && episode && <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>

      <IconButton size={32} icon="chevron-down" color={theme.title} style={styles.closeFull}
        onPress={closeFull}
      />

      {/* <Boost onPress={boost} style={{position:'absolute',right:15,top:width-108,zIndex:200}} inert={false} /> */}

      {pod.image && <View style={{ ...styles.imgWrap, width, height: width - 34 }}>
        <FastImage source={{ uri: episode.image || pod.image }}
          style={{ width: width - 78, height: width - 78, marginLeft: 39, marginTop: 25, borderRadius: 19 }} resizeMode={'cover'}
        />
        <Replay msgs={replayMsgs.current} playing={playing} />
      </View>}
      <View style={styles.top}>
        {episode.title && <Text style={{ color: theme.title, fontSize: 18 }} numberOfLines={1}>
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
          myPubkey={user.publicKey} boost={boost} speed={speed} setRate={setRate}
        />
      </View>
      {(pod.episodes ? true : false) && <View style={styles.listWrap}>
        <View style={{ ...styles.episodesLabel, borderBottomColor: theme.border }}>
          <Text style={{ color: theme.subtitle, fontSize: 12, fontWeight: 'bold' }}>EPISODES</Text>
          <Text style={{ color: theme.subtitle, opacity: 0.85, fontSize: 12, marginLeft: 10 }}>{pod.episodes.length}</Text>
        </View>
        <ItemList style={styles.list} data={pod.episodes} fallbackImage={pod.image}
          renderItem={renderListItem} selectedEpisodeID={selectedEpisodeID}
        />
      </View>}
    </ScrollView>}
  </View>
}

function ItemList({ data, renderItem, style, selectedEpisodeID, fallbackImage }) {
  return <View style={style}>
    {data && data.map((item, index) => {
      const selected = selectedEpisodeID === item.id
      return renderItem({ item, index, selected, fallbackImage })
    })}
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    maxWidth: '100%',
    minWidth: '100%',
    zIndex: 150,
    top: 50,
    flex: 1,
    display: 'flex',
    backgroundColor: 'black',
    height: '100%'
  },
  imgWrap: {
    width: '100%',
    position: 'relative'
  },
  spinWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    color: 'white'
  },
  scroll: {
    margin: 4,
    flex: 1,
    display: 'flex',
    maxHeight: '90%',
    overflow: 'scroll',
  },
  inner: {
    margin: 4,
    display: 'flex',
    position: 'relative',
    alignItems: 'center'
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  info: {
    marginLeft: 15,
    marginTop: 0,
    display: 'flex',
    flex: 1,
    justifyContent: 'space-around',
  },
  podcastTitle: {
    fontSize: 15,
    marginBottom: 8,
    maxWidth: '100%'
  },
  track: {
    width: '90%',
    // height:128,
  },
  listWrap: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },
  list: {
    display: 'flex',
    flex: 1
  },
  closeFull: {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 150
  },
  clickList: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 150
  },
  episode: {
    height: 45,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    position: 'relative'
  },
  episodeTitle: {
    fontSize: 14
  },
  episodesLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    padding: 4,
    marginTop: 8, marginBottom: 6
  }
})

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}