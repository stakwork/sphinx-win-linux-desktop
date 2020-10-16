import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
// import {Player} from '@react-native-community/audio-toolkit'
import { IconButton } from 'react-native-paper';

export default function AudioPlayer(props) {
  const {source, jumpTo} = props
  const [percent, setPercent] = useState(0)
  const [playing,setPlaying] = useState(false)
  // const [audioRecorderPlayer,setAudioRecorderPlayer] = useState(null)

  const audioRecorderPlayer = useRef<any>()
  useEffect(() => {
    audioRecorderPlayer.current = new AudioRecorderPlayer()
    try {
      audioRecorderPlayer.current.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.current.stopPlayer().catch(()=>{})
          setPercent(0)
          setPlaying(false)
          audioRecorderPlayer.current.seekToPlayer(0).catch(()=>{})
        } else {
          setPercent(Math.ceil(
            e.current_position / e.duration * 100
          ))
        }
        // audioRecorderPlayer.mmssss(Math.floor(e.current_position))
      })
      return ()=> {
        if(audioRecorderPlayer.current) {
          audioRecorderPlayer.current.stopPlayer().catch(()=>{})
          audioRecorderPlayer.current.removePlayBackListener()
        }
      }
    } catch(e) {}
  }, [])
  async function toggle() {
    try {
      if(playing) {
        setPlaying(false)
        audioRecorderPlayer.current.stopPlayer().catch(()=>{})
      } else {
        setPlaying(true)
        if(jumpTo) {
          await audioRecorderPlayer.current.startPlayer(source).catch(()=>{})
          await audioRecorderPlayer.current.seekToPlayer(jumpTo).catch(()=>{})
        } else {
          audioRecorderPlayer.current.startPlayer(source).catch(()=>{})
        }
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