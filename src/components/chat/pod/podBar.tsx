import React, {useState,useEffect} from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { IconButton, ActivityIndicator } from 'react-native-paper'
import { useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import Rocket from './rocket'
import CustomIcon from '../../utils/customIcons'
import TouchableIcon from '../../utils/touchableIcon'
import { getPosition } from './position'
import useInterval from '../../utils/useInterval'

export default function PodBar({ duration, episode, onToggle, playing, onShowFull, boost, loading, podError }) {
  const theme = useTheme()
  const [pos,setPos] = useState(0)

  useEffect(()=>{
    const p = getPosition()
    if(p!==pos) setPos(p)
  },[])

  useInterval(()=>{
    const p = getPosition()
    if(p!==pos) setPos(p)
  }, 1000)

  function getProgress(){
    if(!duration || !pos) return 0;
    return pos / duration;
  }

  async function fastForward() {
    const P = getPosition()
    TrackPlayer.seekTo(P + 30);
    setPos(P)
  }

  const height = 58

  if(loading || podError) {
    return <View style={{ ...styles.wrap, backgroundColor: theme.dark ? theme.deep : theme.bg, borderTopColor: theme.border, height }}>
      <View style={styles.inner}>
        <View style={styles.title}>
          <ActivityIndicator animating={true} color={theme.title} size={13} style={{marginLeft:14}} />
          <Text style={{ color: theme.title, marginLeft: 14, maxWidth: '100%' }} numberOfLines={1}>
            {podError?'Error loading podcast':'loading...'}
          </Text>
        </View>
      </View>
    </View>
  }

  return <View style={{ ...styles.wrap, backgroundColor: theme.dark ? theme.deep : theme.bg, borderTopColor: theme.border, height }}>
    <TouchableOpacity onPress={onShowFull} style={styles.touchable}>
      <View style={styles.inner}>
        <View style={styles.title}>
          <Text style={{ color: theme.title, marginLeft: 14, maxWidth: '100%' }} numberOfLines={1}>
            {episode.title}
          </Text>
        </View>
        <View style={styles.iconz}>
          <IconButton icon={playing ? 'pause' : 'play'}
            color={theme.title} size={26}
            onPress={onToggle} style={{ marginRight: 15 }}
          />
          <TouchableIcon
            rippleColor={theme.title} size={42}
            onPress={fastForward}
          >
            <CustomIcon size={26} name="forward-30" color={theme.title} />
          </TouchableIcon>
          <Rocket onPress={boost} />
        </View>
      </View>
      <View style={styles.progressWrap}>
        <View style={{width:`${getProgress()*100}%`,...styles.progress,backgroundColor:theme.primary}} />
      </View>
    </TouchableOpacity>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    zIndex: 150,
    borderTopWidth: 2,
    display: 'flex',
  },
  touchable: {
    display: 'flex', flex: 1,
  },
  inner:{
    display: 'flex', flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    display: 'flex', flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconz: {
    display: 'flex', flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: 10
  },
  progressWrap:{
    width:'100%',
    height:3,
  },
  progress:{
    height:3,
  }
})

