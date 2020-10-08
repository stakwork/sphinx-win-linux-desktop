import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
// import {Player} from '@react-native-community/audio-toolkit'

export default function AudioPlayer(props) {
  const { source } = props
  const [percent, setPercent] = useState(0)
  // const [audioRecorderPlayer,setAudioRecorderPlayer] = useState(null)
  useEffect(() => {
    // setAudioRecorderPlayer(new AudioRecorderPlayer())
    // var p = new Player(source);
    // console.log(p,source,props)
    //   console.log(source)
    //   RNMediaMetadataRetriever.getMetadata(source)
    //   .then((info) => {
    //       console.log(info)
    //   })
    //   .catch((error) => {
    //       console.log(error)
    //   })
  }, [])
  async function play() {
    // console.log('PLAY',source)
    try {
      const audioRecorderPlayer = new AudioRecorderPlayer()
      await audioRecorderPlayer.startPlayer(source)
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer().catch(()=>{})
          setPercent(0)
          audioRecorderPlayer.removePlayBackListener()
        } else {
          setPercent(Math.ceil(
            e.current_position / e.duration * 100
          ))
        }
        // audioRecorderPlayer.mmssss(Math.floor(e.current_position))
      })
    } catch (e) {
      console.log(e)
    }
  }
  return <View style={styles.wrap}>
    <Icon name="play" color="grey" size={27}
      onPress={play}
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