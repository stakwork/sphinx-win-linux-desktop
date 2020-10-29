import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Animated} from 'react-native'
import LottieView from 'lottie-react-native';
import EE, {PLAY_ANIMATION} from '../../utils/ee'
import {useStores} from '../../../store'
import {usePicSrc} from '../../utils/picSrc'
import FastImage from 'react-native-fast-image';
import Boost from './boost'

const lens = { // min 1000
  confetti: {
    time: 3000
  }
}

export default function Anim() {
  const {contacts} = useStores()
  const [show,setShow] = useState(false)

  const meContact = contacts.contacts.find(c=> c.id===1)
  let meIMG = usePicSrc(meContact)

  const opacity = useRef(new Animated.Value(0)).current;

  const confetti = useRef<LottieView>()

  function fade(len:number){
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        delay: Math.max(len-1000, 0)
      })
    ]).start();
  }
  function play(){
    const name = 'confetti'
    const len = lens[name].time
    fade(len)
    requestAnimationFrame(async ()=>{
      setShow(true)
      confetti.current.play();
      await sleep(len)
      setShow(false)
    })
  }

  useEffect(()=>{
    EE.on(PLAY_ANIMATION, play)
    return () => {
      EE.removeListener(PLAY_ANIMATION, play)
    }
  },[])

  const zIndex = show?151:99
  return <Animated.View style={{
      ...styles.wrap, zIndex, opacity
    }}>
    <View style={styles.backdrop} />

    <View style={styles.content}>
      {(meIMG?true:false) && <FastImage resizeMode="cover" 
        source={{uri:meIMG}}
        style={{width:120,height:120,borderRadius:60,zIndex:102}}
      />}
      <Boost inert={true} style={{marginTop:-40,zIndex:104}} onPress={()=>{}} />
    </View>

    <LottieView
      ref={confetti} loop={false}
      style={{width:300, height:400, position:'absolute'}}
      source={require('../../../animations/confetti.json')}
    />
  </Animated.View>
}

const styles = StyleSheet.create({
  wrap:{
    display:'flex',flex:1,
    backgroundColor:'rgba(0,0,0,0.5)',
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    alignItems:'center',
    justifyContent:'center'
  },
  backdrop:{
    display:'flex',flex:1,
    backgroundColor:'rgba(0,0,0,0.5)',
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
  },
  content:{
    display:'flex',
    alignItems:'center'
  }
})

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}