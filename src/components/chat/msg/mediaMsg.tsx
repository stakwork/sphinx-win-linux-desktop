import React, {useEffect, useState} from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import {useStores} from '../../../store'
import shared from './sharedStyles'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {useCachedEncryptedFile} from './hooks'
import {ActivityIndicator} from 'react-native-paper'

export default function MediaMsg(props){
  console.log(props)
  const {meme,ui} = useStores()

  const {message_content} = props

  const {imgData,loading} = useCachedEncryptedFile(props)

  const hasImgData = imgData?true:false
  const hasContent = message_content?true:false
  return <TouchableOpacity style={styles.wrap} onPress={()=>{
    if(imgData) ui.setImgViewerParams({data:imgData})
  }} activeOpacity={0.65}>
    {hasImgData && !loading && <Image style={styles.img} resizeMode='cover' source={{uri:imgData}}/>}
    {loading && <View style={styles.loading}>
      <ActivityIndicator animating={true} color="white" />
    </View>}
    {hasContent && <View style={shared.innerPad}>
      <Text style={styles.text}>{message_content}</Text>
    </View>}
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  text:{
    color:'#333',
    fontSize:16,
  },
  wrap:{
    // flex:1,
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
