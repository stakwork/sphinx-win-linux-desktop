import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
// import {Player} from '@react-native-community/audio-toolkit'
import { IconButton } from 'react-native-paper';
import ARP from './audioRecorderPlayer'

let nonStateSeconds = 0

export default function AudioPlayer(props) {
  const {source, jumpTo} = props
  const [percent, setPercent] = useState(0)
  const [playing,setPlaying] = useState(false)

  useEffect(() => {
    return ()=>{
      if(playing) ARP.stop()
    }
  }, [playing])
  
  async function toggle() {
    try {
      if(playing) {
        setPlaying(false)
        ARP.stop()
      } else {
        setPlaying(true)
        ARP.play(source, jumpTo, e=>{
          if (e.current_position === e.duration) {
            ARP.stop()
            setPercent(0)
            setPlaying(false)
            ARP.seekTo(0)
          } else {
            const secs = Math.round(e.current_position/1000)
            if(secs!==nonStateSeconds) {
              if(props.onListenOneSecond) props.onListenOneSecond(source)
              nonStateSeconds = secs
            }
            setPercent(Math.ceil(
              e.current_position / e.duration * 100
            ))
          }
        })
      }
    } catch (e) {
      console.log(e)
    }
  }
  return <View style={styles.wrap}>
    <IconButton icon={playing?'pause':'play'} color="#ccc" size={27}
      onPress={toggle}
    />
    <View style={styles.barWrap}>
      <View style={styles.barEmpty}></View>
      <View style={{
        ...styles.barFull,
        width: `${percent}%`
      }}></View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  barWrap: {
    flex: 1,
    height: 4, maxHeight: 4,
    backgroundColor: 'blue',
    marginRight: 7,
    position: 'relative'
  },
  barEmpty: {
    backgroundColor: '#ddd',
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: 4,
  },
  barFull: {
    backgroundColor: '#aaa',
    position: 'absolute',
    top: 0, left: 0,
    height: 4,
  }
})