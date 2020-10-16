import React, {useRef} from 'react'
import {View,Text,StyleSheet} from 'react-native'
import { useParsedClipMsg } from '../../../store/hooks/msg'
import AudioPlayer from './audioPlayer'
import EE from '../../utils/ee'
import {useTheme} from '../../../store'

const NUM_SECONDS = 5

export default function ClipMessage(props){
  const count = useRef(0)
  const theme = useTheme()
  const {message_content} = props
  
  const obj = useParsedClipMsg(message_content)
  const { url, title, text, ts } = obj
  function onListenOneSecond(feedURL){
    count.current = count.current + 1
    if(count.current && count.current%NUM_SECONDS===0) {
      EE.emit('clip-payment',obj)
    }
  };
  return <View>
    {(title?true:false) && <Text style={{...styles.littleTitle,color:theme.title}}>{title}</Text>}
    <AudioPlayer source={url} jumpTo={ts||0} 
      onListenOneSecond={onListenOneSecond}
    />
    <Text style={{...styles.textPad,color:theme.title,paddingTop:0}}>{text}</Text>
  </View>
}

const styles = StyleSheet.create({
  linkWrap:{
    display:'flex'
  },
  link:{
    padding:10,
    color:'#6289FD',
  },
  text: {
    fontSize: 16,
  },
  textPad: {
    color: '#333',
    fontSize: 16,
    paddingTop:10,
    paddingBottom:10,
    paddingLeft:12,
    paddingRight:12
  },
  littleTitle:{
    fontSize: 11,
    paddingTop:10,
    paddingLeft:12,
    paddingRight:12
  }
})