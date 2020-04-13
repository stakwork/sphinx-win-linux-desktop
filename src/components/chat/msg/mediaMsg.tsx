import React, {useEffect, useRef, useState} from 'react'
import {View, Text, StyleSheet, Image} from 'react-native'
import {useStores} from '../../../store'
import shared from './sharedStyles'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {useCachedEncryptedFile} from './hooks'
import {ActivityIndicator,Button} from 'react-native-paper'
import AudioPlayer from './audioPlayer'
import {parseLDAT} from '../../utils/ldat'

export default function MediaMsg(props){  
  const {meme,ui,msg} = useStores()
  const wrapRef = useRef(null)
  const [buying,setBuying] = useState(false)
  const {message_content, media_type, chat, media_token} = props

  const ldat = parseLDAT(media_token)

  let amt = null
  let purchased = false
  if(ldat.meta&&ldat.meta.amt) {
    amt = ldat.meta.amt
    if(ldat.sig) purchased=true
  }
  const {data,uri,loading,trigger} = useCachedEncryptedFile(props,ldat)

  useEffect(()=>{
    if(props.y && wrapRef.current){ // dont run if y=0 (beginning)
      wrapRef.current.measure((fx, fy, width, height, px, py)=>{
        if(py>0) trigger()
      })
    }
  },[props.y, props.media_token]) // refresh when scroll, or when purchase accepted

  async function buy(amount){
    setBuying(true)
    const contact_id=chat.contact_ids && chat.contact_ids.find(cid=>cid!==1)
    await msg.purchaseMedia({
      chat_id: chat.id,
      media_token,
      amount,
      contact_id,
    })
    setBuying(false)
  }

  // console.log(props)

  function tap(){
    if(media_type.startsWith('image')){
      if(data) ui.setImgViewerParams({data})
    }
  }

  const hasImgData = (data||uri)?true:false
  const hasContent = message_content?true:false
  let h = 200
  if(hasContent) h+=49
  if(amt) h+=37
  return <View ref={wrapRef} collapsable={false}>
    <TouchableOpacity style={{...styles.wrap, height:h, minHeight:h}} onPress={tap} activeOpacity={0.65}>
      {!hasImgData && <View style={styles.loading}>
        {loading && <ActivityIndicator animating={true} color="white" />}
      </View>}
      {hasImgData && <Media type={media_type} data={data} uri={uri} />}
      {hasContent && <View style={shared.innerPad}>
        <Text style={styles.text}>{message_content}</Text>
      </View>}
      {amt && <Button style={styles.payButton} mode="contained" dark={true}
        onPress={()=>buy(amt)}
        loading={buying}
        icon={purchased?'check':'arrow-top-right'}>
        {purchased?'Purchased':`Pay ${amt} sat`}
      </Button>}
    </TouchableOpacity>
  </View>
}

function Media({type,data,uri}){
  // console.log(type,uri)
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
  },
  payButton:{
    backgroundColor:'#4AC998',
    width:'100%',
    borderRadius:5,
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
  }
})
