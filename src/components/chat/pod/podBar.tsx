import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import {IconButton} from 'react-native-paper'
import { useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import Rocket from './rocket'

export default function PodBar({ pod, episode, onToggle, playing, onShowFull, boost }) {
  const theme = useTheme()
  
  async function fastForward() {
    const pos = await TrackPlayer.getPosition()
    TrackPlayer.seekTo(pos + 30);
  }

  const height=58
  return <View style={{...styles.wrap, backgroundColor: theme.border, borderBottomColor: theme.border, height}}>
    <TouchableOpacity onPress={onShowFull} style={styles.touchable}>
      <View style={styles.title}>
        <Text style={{color:theme.title,marginLeft:14,maxWidth:'100%'}} numberOfLines={1}>
          {episode.title}
        </Text>
      </View>
      <View style={styles.iconz}>
        <IconButton icon={playing ? 'pause' : 'play'}
          color={theme.title} size={26}
          onPress={onToggle} style={{marginRight:15}}
        />
        <IconButton icon="fast-forward-30"
          color={theme.title} size={20}
          onPress={fastForward}
        />
        <Rocket onPress={boost} />
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
    display:'flex',
    flexDirection:'row',
  },
  touchable:{
    display:'flex',flex:1,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  title:{
    display:'flex',flex:1,
    flexDirection:'row',
    alignItems:'center',
  },
  iconz:{
    display:'flex',flex:1,
    flexDirection:'row-reverse',
    alignItems:'center',
    paddingRight:10
  },
})

