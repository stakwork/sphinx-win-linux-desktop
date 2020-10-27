import React, { useRef, useState } from 'react'
import { View, Animated, StyleSheet, Text, TouchableOpacity } from 'react-native'
import {IconButton, TouchableRipple} from 'react-native-paper'
import { useTheme } from '../../../store'
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

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

function Rocket({onPress}){
  const theme = useTheme()
  const size = useRef(new Animated.Value(1)).current;
  function go(){
    Animated.sequence([
      Animated.timing(size, {
        toValue: 2.5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(size, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    onPress()
  }
  return <TouchableRipple style={styles.rocketWrap} rippleColor={theme.accent} onPress={go} borderless>  
    <View style={{...styles.circle,backgroundColor:theme.accent}}>
      <Animated.View style={{  
          transform:[{scale:size}]
        }}>
        <Icon color="white" size={20} name="rocket-launch" /> 
      </Animated.View>
    </View>
  </TouchableRipple>
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
  rocketWrap:{
    height:55,width:55,
    borderRadius:27,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginRight:5
  },
  circle:{
    height:30,width:30,
    borderRadius:15,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  }
})

