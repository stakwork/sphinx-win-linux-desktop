import React, {useEffect, useRef, useState} from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import {useStores} from '../../../store'
import shared from './sharedStyles'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {useCachedEncryptedFile} from './hooks'
import {ActivityIndicator} from 'react-native-paper'
import AudioPlayer from './audioPlayer'

export default function MediaMsg(props){
  const wrapRef = useRef(null)
  const [first, setFirst] = useState(true)
  
  const {meme,ui} = useStores()

  const {message_content, media_type} = props

  const {data,uri,loading,trigger} = useCachedEncryptedFile(props)

  useEffect(()=>{
    if(props.y && wrapRef.current){ // dont run if y=0 (beginning)
      wrapRef.current.measure((fx, fy, width, height, px, py)=>{
        if(py>0) trigger()
      })
    }
  },[props.y])

  // console.log(props)

  function tap(){
    if(media_type.startsWith('image')){
      if(data) ui.setImgViewerParams({data})
    }
  }

  const hasImgData = (data||uri)?true:false
  const hasContent = message_content?true:false
  const h = hasContent?249:200
  return <View ref={wrapRef} collapsable={false}>
    <TouchableOpacity style={{...styles.wrap, height:h, minHeight:h}} onPress={tap} activeOpacity={0.65}>
      {!hasImgData && <View style={styles.loading}>
        {loading && <ActivityIndicator animating={true} color="white" />}
      </View>}
      {hasImgData && <Media type={media_type} data={data} uri={uri} />}
      {hasContent && <View style={shared.innerPad}>
        <Text style={styles.text}>{message_content}</Text>
      </View>}
    </TouchableOpacity>
  </View>
}

function Media({type,data,uri}){
  console.log(type,uri)
  if(type.startsWith('image')) {
    return <Image style={styles.img} resizeMode='cover' source={{uri:uri||data}} />
  }
  if(type.startsWith('audio')) {
    return <AudioPlayer source={uri||data} />
  }
}


const styles = StyleSheet.create({
  text:{
    color:'#333',
    fontSize:16,
  },
  wrap:{
    // flex:1,
    width:200,
    minHeight:200,
  },
  img:{
    width:200,
    height:200
  },
  loading:{
    width:200,
    height:200,
    backgroundColor:'rgba(0,0,0,0.8)',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  }
})
