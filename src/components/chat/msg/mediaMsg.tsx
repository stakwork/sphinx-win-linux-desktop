import React, {useEffect, useState} from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import {parseLDAT} from '../../utils/ldat'
import RNFetchBlob from 'rn-fetch-blob'
import {useStores} from '../../../store'
import * as aes from '../../../crypto/aes'
import shared from './sharedStyles'
import { TouchableOpacity } from 'react-native-gesture-handler'

export default function MediaMsg(props){
  console.log(props)
  const {meme,ui} = useStores()
  const [imgData, setImgData] = useState('')

  const {message_content, media_token, media_key, media_type} = props

  useEffect(()=>{
    (async () => {
      const ldat = parseLDAT(media_token)
      if(!(ldat && ldat.host)) return
      const url = `https://${ldat.host}/file/${media_token}`
      const server = meme.servers.find(s=> s.host===ldat.host)
      if(!server) return 
      try {
        const res = await RNFetchBlob.fetch('GET', url, {
          Authorization : `Bearer ${server.token}`,
        })
        let status = res.info().status
        if(status == 200) {
          let base64Str = res.base64() // native conversion
          const dec = await aes.decryptToBase64(base64Str, media_key)
          const dataURI = `data:${media_type};base64,${dec}`
          setImgData(dataURI)
        }
      } catch(e) {
        console.log(e)
      }
    })()
  },[])

  const hasImgData = imgData?true:false
  const hasContent = message_content?true:false
  return <TouchableOpacity style={styles.wrap} onPress={()=>{
    if(imgData) ui.setImgData(imgData)
  }} activeOpacity={0.65}>
    {hasImgData && <Image style={styles.img} resizeMode='cover' source={{uri:imgData}}/>}
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
  }
})