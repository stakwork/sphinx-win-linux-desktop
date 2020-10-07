import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native'
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
    console.log(ps)
    // Set up the player
    await TrackPlayer.setupPlayer();
    // Add a track to the queue
    await TrackPlayer.add({
      id: ps.id,
      url: ps.enclosureUrl,
      title: ps.title,
      artist: ps.author || 'author',
      artwork: ps.image
    });
    // Start playing it
    await TrackPlayer.play();
    setPlaying(true)
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
    if (!show) {
      TrackPlayer.stop()
    }
  }, [show])

  if (!show) {
    return <></>
  }
  return <View style={{ ...styles.wrap, backgroundColor: theme.bg, borderBottomColor: theme.border }}>
    {loading && <ActivityIndicator animating={true} color="#bbb" />}
    {!loading && params && <View style={styles.inner}>
      <View style={styles.top}>
        {params.image && <Image source={{ uri: params.image }}
          style={{ width: 88, height: 88 }} resizeMode={'cover'}
        />}
        <View style={styles.info}>
          {params.title && <Text style={{ color: theme.title }}>{params.title}</Text>}
        </View>
      </View>
      <View style={styles.track}>
        <PlayerBar theme={theme} onToggle={onToggle} playing={playing} 
        />
      </View>
    </View>}
  </View>
}

class PlayerBar extends TrackPlayer.ProgressComponent {
  render() {
    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressWrapTop}>
          <IconButton icon={this.props.playing?'pause':'play'} 
            color={this.props.theme.title} size={26} 
            onPress={()=> this.props.onToggle(this.state.position)}
          />
          <Text style={{color:this.props.theme.title}}>
            {moment.duration(this.state.position,'seconds').format('hh:mm:ss')}
          </Text>
        </View>
        <ProgressBar color="#6289FD"
          progress={this.getProgress()}
          // buffered={this.getBufferedProgress()}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    height: 208,
    zIndex: 150,
    borderBottomWidth: 2
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
    justifyContent:'space-around'
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
  progressWrapTop:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%',
    marginBottom:5,
  }
})
