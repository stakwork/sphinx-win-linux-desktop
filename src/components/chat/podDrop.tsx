import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native'
import { useStores, useTheme } from '../../store'
import TrackPlayer from 'react-native-track-player';
import moment from 'moment'
import { ProgressBar, IconButton } from 'react-native-paper';
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

export default function PodDrop({ show, host, uuid, url }) {
  const theme = useTheme()
  const { chats } = useStores()
  const [params, setParams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playing,setPlaying] = useState(false)
  const [duration,setDuration] = useState(0)

  async function loadParams() {
    setLoading(true)
    const params = await chats.loadFeed(host, uuid, url)
    if (params) setParams(params)
    if (params) start(params)
    setLoading(false)
  }

  function onToggle(ts){
    if(playing) TrackPlayer.pause()
    else TrackPlayer.play()
    setPlaying(!playing)
  }

  const start = async (ps) => {
    const episode = ps && ps.episodes && ps.episodes.length && ps.episodes[0]
    if(!episode) return
    // Add a track to the queue
    await TrackPlayer.add({
      id: episode.id,
      url: episode.enclosureUrl,
      title: episode.title,
      artist: episode.author || 'author',
      artwork: episode.image
    });
    // Start playing it
    await TrackPlayer.play();
    setPlaying(true)

    setTimeout(async ()=>{
      const dur = await TrackPlayer.getDuration()
      setDuration(dur)
    },850)
  };

  async function checkState(){
    const state = await TrackPlayer.getState()
    if(state===TrackPlayer.STATE_PAUSED || state===TrackPlayer.STATE_STOPPED) {
      setPlaying(false)
    }
    if(state===TrackPlayer.STATE_PLAYING) {
      setPlaying(true)
    }
  }

  useEffect(() => {
    if (show){
      checkState()
      if(!params) loadParams()
    }
    // if (!show) {
    //   TrackPlayer.stop()
    // }
  }, [show])

  if (!show) {
    return <></>
  }
  const height = 215
  const episode = params && params.episodes && params.episodes.length && params.episodes[0]
  return <View style={{ ...styles.wrap, backgroundColor: theme.bg, borderBottomColor: theme.border, height }}>
    {loading && <View style={{height, ...styles.spinWrap}}>
      <ActivityIndicator animating={true} color="#bbb" />
    </View>}
    {!loading && episode && <View style={styles.inner}>
      <View style={styles.top}>
        {episode.image && <Image source={{ uri: episode.image }}
          style={{ width: 88, height: 88 }} resizeMode={'cover'}
        />}
        <View style={styles.info}>
          {params.title && <Text style={{ color: theme.title, ...styles.podcastTitle }} numberOfLines={1}>
            {params.title}
          </Text>}
          {episode.title && <Text style={{ color: theme.title, fontSize:13 }} numberOfLines={1}>
            {episode.title}
          </Text>}
        </View>
      </View>
      <View style={styles.track}>
        <PlayerBar theme={theme} onToggle={onToggle} playing={playing} 
          duration={duration}
        />
      </View>
    </View>}
  </View>
}

class PlayerBar extends TrackPlayer.ProgressComponent {
  fastForward = () => {
    TrackPlayer.seekTo(this.state.position+10);
  }
  rewind = () => {
    TrackPlayer.seekTo(this.state.position<10?0:this.state.position-10)
  }
  track = (e) => {
    const {duration} = this.props
    if(duration) {
      const x = e.nativeEvent.locationX
      this.bar.measure( (fx, fy, width, height, px, py) => {
        const ratio = x/width
        const secs = duration*ratio
        TrackPlayer.seekTo(secs);
      })
    }
  }
  render() {
    const {theme,onToggle,playing,duration} = this.props
    let time = moment.duration(this.state.position,'seconds').format('hh:mm:ss')
    if(duration) {
      time += ` / ${moment.duration(duration,'seconds').format('hh:mm:ss')}`
    }
    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressWrapTop}>
          <View style={{height:1,width:100}}/>
          <View style={styles.controls}>
            <IconButton icon="rewind-10"
              color={theme.title} size={20} 
              onPress={this.rewind}
            />
            <IconButton icon={playing?'pause':'play'} 
              color={theme.title} size={26} 
              onPress={()=> onToggle(this.state.position)}
            />
            <IconButton icon="fast-forward-10"
              color={theme.title} size={20} 
              onPress={this.fastForward}
            />
          </View>
          <Text style={{color:theme.title,width:110,textAlign:'right',fontSize:11}}>
            {time}
          </Text>
        </View>
        <TouchableOpacity onPress={this.track} style={styles.progressTouch}
          ref={r=> this.bar=r}>
          <ProgressBar color="#6289FD"
            progress={this.getProgress()}
            // buffered={this.getBufferedProgress()}
          />
        </TouchableOpacity>
      </View>
    );
  }

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
    display:'flex',
    flex:1,
    justifyContent:'space-around'
  },
  podcastTitle:{
    fontSize:15, 
    marginBottom:8,
    maxWidth:'100%'
  },
  controls:{
    display:'flex',
    alignItems:'center',
    flexDirection:'row'
  },
  track: {
    width:'100%',
    height:32
  },
  progressWrap:{
    marginTop:5,
    display:'flex',
    width:'100%',
  },
  progressTouch:{
    height:45,
    display:'flex',
    justifyContent:'center'
  },
  progressWrapTop:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%',
  }
})
