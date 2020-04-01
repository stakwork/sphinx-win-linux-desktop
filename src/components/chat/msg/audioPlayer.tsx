import React, {useRef, useEffect} from 'react'
import {View,StyleSheet} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Audio } from 'expo-av';
import AudioRecorderPlayer from 'react-native-audio-recorder-player'


export default function AudioPlayer(props){
  const {source} = props
  async function play(){
    console.log('PLAY',source)
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({
        uri:source, overrideFileExtensionAndroid:'m4a'
      })//, {androidImplementation:'MediaPlayer'});
      await soundObject.playAsync();
    } catch(e) {
      console.log(e)
    }
    // try {
    //   const audioRecorderPlayer = new AudioRecorderPlayer()
    //   const uri = await audioRecorderPlayer.startPlayer('file:///sdcard/sound.mp4')
    //   console.log(uri)
    // } catch(e) {
    //   console.log(e)
    // }
  }
  return <View style={styles.wrap}>
    <MaterialCommunityIcons name="play" color="grey" size={27} 
      onPress={play}
    />
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    display:'flex',
    width:'100%',
    marginBottom:20
  }
})