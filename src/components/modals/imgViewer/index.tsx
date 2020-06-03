import React, {useState, useRef, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, StyleSheet, Image,Dimensions,TextInput,Text,TouchableOpacity,BackHandler} from 'react-native'
import {IconButton} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {randString} from '../../../crypto/rand'
import RNFetchBlob from 'rn-fetch-blob'
import * as e2e from '../../../crypto/e2e'
import {ActivityIndicator} from 'react-native-paper'
import SetPrice from './setPrice'
import EE from '../../utils/ee'
import { constants } from '../../../constants'

export default function ImgViewer(props) {
  const {params} = props
  const {data, uri, chat_id, contact_id} = params
  const { ui,meme,msg,chats } = useStores()

  const [text,setText] = useState('')
  const [price, setPrice] = useState(0)
  const [inputFocused, setInputFocused] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPercent,setUploadedPercent] = useState(0)
  const inputRef = useRef(null)

  const w = Math.round(Dimensions.get('window').width)
  const h = Math.round(Dimensions.get('window').height)
  const showImg = (uri||data)?true:false
  const showInput = (contact_id||chat_id)?true:false
  const showMsgMessage = params.msg?true:false

  async function sendFinalMsg({muid,media_key,media_type,price}){
    await msg.sendAttachment({
      contact_id, chat_id,
      muid, price,
      media_key, media_type,
      text:showMsgMessage?'':text,
    })
    ui.setImgViewerParams(null)
  }

  async function sendAttachment(){
    if(uploading) return

    setUploading(true)
    inputRef.current.blur()

    const type = showMsgMessage?'text/plain':'image/jpg'
    const name = showMsgMessage?'Message.txt':'Image.jpg'
    const pwd = await randString(32)
    const server = meme.getDefaultServer()
    if(!server) return
    if(!(uri || (showMsgMessage&&text))) return

    let enc
    if (showMsgMessage) {
      enc = await e2e.encrypt(text, pwd)
    } else {
      enc = await e2e.encryptFile(uri, pwd)
    }
    RNFetchBlob.fetch('POST', `https://${server.host}/file`, {
      Authorization: `Bearer ${server.token}`,
      'Content-Type': 'multipart/form-data'
    }, [{
        name:'file',
        filename:name,
        type: type,
        data: enc,
      }, {name:'name', data:name}
    ])
    // listen to upload progress event, emit every 250ms
    .uploadProgress({ interval : 250 },(written, total) => {
        console.log('uploaded', written / total)
        setUploadedPercent(Math.round((written / total)*100))
    })
    .then(async (resp) => {
      let json = resp.json()
      console.log('done uploading',json)
      await sendFinalMsg({
        muid:json.muid,
        media_key:pwd,
        media_type:type,
        price
      })
      setUploading(false)
    })
    .catch((err) => {
       console.log(err)
    })
  }

  useEffect(()=>{
    BackHandler.addEventListener('hardwareBackPress', function() {
      ui.setImgViewerParams(null)
      return true
    })
    return () => {
      EE.emit('left-image-viewer')
      BackHandler.removeEventListener('hardwareBackPress', ()=>{})
    }
  },[])

  const boxStyles = {width:w,height:h-130,top:80}
  const disabled = uploading || (showMsgMessage&&!price)

  const theChat = chat_id && chats.chats.find(c=> c.id===chat_id)
  const isTribe = theChat && theChat.type===constants.chat_types.tribe
  return useObserver(() =>
    <View style={styles.wrap}>
      <IconButton
        icon="arrow-left"
        color="white"
        size={27}
        style={styles.back}
        onPress={() => {
          ui.setImgViewerParams({data:'',uri:''})
        }}
      />

      {/* {showInput && !isTribe && <SetPrice setAmount={amt=> setPrice(amt)} />} */}
      {showInput && <SetPrice setAmount={amt=> setPrice(amt)} />}

      {showImg && <Image resizeMode='cover' source={{uri:uri||data}}
        style={{...styles.img,...boxStyles}} 
      />}
      {showMsgMessage && !uploading && <View style={{...styles.msgMessage,...boxStyles}}>
        <Text style={styles.msgMessageText}>Set a price and enter your message</Text>
      </View>}

      {uploading && <View style={{...styles.activityWrap,width:w,height:h-180}}>
        <ActivityIndicator animating={true} color="white" size="large" />
        <Text style={styles.progressNum}>
          {`${uploadPercent}%`}
        </Text>
      </View>}

      {showInput && <View style={styles.send}>
        <TextInput 
          placeholder="Message..." ref={inputRef}
          style={styles.input}
          onFocus={()=> setInputFocused(true)}
          onBlur={()=> setInputFocused(false)}
          onChangeText={e=> setText(e)}>
          <Text>{text}</Text>
        </TextInput>
        <View style={styles.sendButtonWrap}>
          <TouchableOpacity activeOpacity={0.5} style={styles.sendButton}
            onPress={()=> sendAttachment()} disabled={disabled}>
            <Icon name="send" size={17} color="white" />
          </TouchableOpacity>
        </View> 
      </View>}
      
    </View>
  )
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    backgroundColor:'black'
  },
  back:{
    position:'absolute',
    left:4,top:31
  },
  img:{
    width:'100%'
  },
  activityWrap:{
    height:'80%',
    width:'100%',
    position:'absolute',
    top:'10%',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  send:{
    position:'absolute',
    width:'100%',
    left:0,right:0,bottom:0,
    display:'flex',
    flexDirection:'row',
    paddingLeft:10,
    paddingRight:10,
  },
  input:{
    flex:1,
    borderRadius:20,
    borderColor:'#ccc',
    backgroundColor:'whitesmoke',
    paddingLeft:18,
    paddingRight:18,
    borderWidth:1,
    height:40,
    fontSize:17,
    lineHeight:20,
  },
  sendButtonWrap:{
    width:55,
    height:40,
  },
  sendButton:{
    backgroundColor:'#6289FD',
    marginLeft:7,
    width:39,maxWidth:39,
    height:39,maxHeight:39,
    borderRadius:19,
    marginTop:1,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  progressNum:{
    color:'white',
    fontSize:16,
    marginTop:16,
  },
  msgMessage:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
  },
  msgMessageText:{
    color:'white'
  }
})
