import React, {useState, useRef, useEffect} from 'react'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, View, Text, TextInput, StyleSheet, PanResponder, Animated, ToastAndroid } from 'react-native'
import {IconButton, Portal, ActivityIndicator} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useStores,useTheme} from '../../store'
import Cam from '../utils/cam'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { constants } from '../../constants'
import AttachmentDialog from './attachmentDialog'
import ReplyContent from './msg/replyContent'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RecDot from './recDot'
import RNFetchBlob from 'rn-fetch-blob'
import { fetchGifs } from './helpers'
import Giphy from './giphy';
import {calcBotPrice} from '../../store/hooks/chat'
import {requestAudioPermissions, uploadAudioFile} from './audioHelpers'
import EE from '../utils/ee'
import {useReplyContent} from '../../store/hooks/chat'

let dirs = RNFetchBlob.fs.dirs

const conversation = constants.chat_types.conversation

const audioRecorderPlayer = new AudioRecorderPlayer()

export default function BottomBar({chat,pricePerMessage,tribeBots}) {
  const {ui,msg,contacts,meme} = useStores()
  const theme = useTheme()
  const [text,setText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recordSecs, setRecordSecs] = useState('0:00')
  const [textInputHeight, setTextInputHeight] = useState(40)
  const [recordingStartTime, setRecordingStartTime] = useState(null)
  const [uploading,setUploading] = useState(false)
  const [gifs, setGifs] = useState([])
  const [searchGif, setSearchGif] = useState('Bitcoin')
  const [showGiphyModal, setShowGiphyModal] = useState(false)
  const [replyUuid, setReplyUuid] = useState('')
  const [extraTextContent, setExtraTextContent] = useState(null)

  const inputRef = useRef(null)

  function sendMessage(){
    if(!text) return
    let contact_id=chat.contact_ids.find(cid=>cid!==1)
    let {price, failureMessage} = calcBotPrice(tribeBots,text)
    if(failureMessage) {
      ToastAndroid.showWithGravityAndOffset(failureMessage, ToastAndroid.SHORT, ToastAndroid.TOP, 0, 125)
      return
    }

    let txt = text
    if(extraTextContent) {
      const {type, ...rest} = extraTextContent
      txt = type+'::'+JSON.stringify({...rest, text})
    }

    msg.sendMessage({
      contact_id:contact_id||null,
      text:txt,
      chat_id: chat.id||null,
      amount:(price+pricePerMessage)||0,
      reply_uuid:replyUuid||''
    })
    setText('')
    if(replyUuid) {
      setReplyUuid('')
      EE.emit('clear-reply-uuid',null)
    }
    if(extraTextContent) {
      setExtraTextContent(null)
    }
    // inputRef.current.blur()
    // setInputFocused(false)
  }

  function gotExtraTextContent(body){
    setExtraTextContent(body)
  }
  function gotReplyUUID(uuid){
    setReplyUuid(uuid)
  }
  function cancelReplyUUID(){
    setReplyUuid('')
  }
  useEffect(()=>{
    EE.on('extra-text-content', gotExtraTextContent)
    EE.on('reply-uuid', gotReplyUUID)
    EE.on('cancel-reply-uuid', cancelReplyUUID)
    return ()=> {
      EE.removeListener('extra-text-content',gotExtraTextContent)
      EE.removeListener('reply-uuid',gotReplyUUID)
      EE.removeListener('cancel-reply-uuid', cancelReplyUUID)
    }
  },[])

  async function tookPic(img){
    setDialogOpen(false)
    setTimeout(()=>{
      setTakingPhoto(false)
      if(img&&img.uri){
        openImgViewer({uri: img.uri})
      }
    },250)
  }

  function openImgViewer(obj){
    let contact_id=null
    if(!chat.id){ // if no chat (new contact)
      contact_id=chat.contact_ids.find(cid=>cid!==1)
    }
    ui.setImgViewerParams({
      contact_id,
      chat_id: chat.id||null,
      ...obj,
      pricePerMessage,
    })
  }

  async function doPaidMessage() {
    setDialogOpen(false)
    openImgViewer({msg: true})
  }

  async function startRecord() {
    setRecordSecs('0:00')
    try{
      await audioRecorderPlayer.startRecorder(dirs.CacheDir+'/sound.mp4')
      audioRecorderPlayer.addRecordBackListener((e) => {
        const str = audioRecorderPlayer.mmssss(
          Math.floor(e.current_position),
        )
        const idx = str.lastIndexOf(':')
        setRecordSecs(str.substr(1,idx-1))
      })
      setRecordingStartTime(Date.now().valueOf())
    } catch(e){
      console.log(e||'ERROR')
    }
  }

  async function stopRecord(cb,time?) {
    const now = Date.now().valueOf()
    let tooShort = false
    if(now-time<1000){
      tooShort = true
      await sleep(1000)
    }
    try{
      const result = await audioRecorderPlayer.stopRecorder()
      audioRecorderPlayer.removeRecordBackListener()
      setRecordSecs('0:00')
      if(cb && !tooShort) cb(result)
    } catch(e){
      console.log(e||'ERROR')
    }
  }

  async function doneUploadingAudio(muid,pwd,type){
    await sendFinalMsg({
      muid:muid,
      media_key:pwd,
      media_type:type,
    })
    setUploading(false)
  }

  // const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState)=> true,
    onMoveShouldSetPanResponderCapture: ()=> true,
    onPanResponderStart:()=>{
      requestAudioPermissions().then(startRecord)
    },
    onPanResponderEnd:async()=>{
      await sleep(10)
      function callback(path){
        setUploading(true)
        uploadAudioFile(path, meme.getDefaultServer(), doneUploadingAudio)
      }
      setRecordingStartTime(current=>{
        if(current) stopRecord(callback,current)
        return null
      })
    },
    onPanResponderMove: (evt, gestureState) => {
      if(gestureState.dx<-70) {  
        setRecordingStartTime(current=>{
          if(current) {
            stopRecord(null) //cancel
            ReactNativeHapticFeedback.trigger("impactLight", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false
            })
          }
          return null
        })
      }
    },
    onPanResponderRelease: (evt, gestureState) => {},
  }), []);

  async function sendFinalMsg({muid,media_key,media_type}){
    await msg.sendAttachment({
      contact_id:null, chat_id:chat.id,
      muid, price:0,
      media_key, media_type,
      text:'',
      amount:0
    })
  }

  async function onGiphyHandler() {
    try {
      const gifs = await fetchGifs(searchGif);
      if (gifs.meta.status === 200) setGifs(gifs.data);
      setDialogOpen(false);
      setShowGiphyModal(true);
    } catch(e) {
      console.warn(e)
    }
  }

  async function getGifsBySearch() {
    const gifs = await fetchGifs(searchGif);
    if (gifs.meta.status === 200) setGifs(gifs.data);
  };

  async function onSendGifHandler(gif: any) {
    setShowGiphyModal(false);
    setDialogOpen(false)
    setTimeout(()=>{
      setTakingPhoto(false)
      const height = parseInt(gif.images.original.height) || 200
      const width = parseInt(gif.images.original.width) || 200
      openImgViewer({
        uri: gif.images.original.url,
        aspect_ratio: width/height,
        id: gif.id,
      })
    },150)
  };

  const isConversation = chat.type===conversation
  const isTribe = chat.type===constants.chat_types.tribe
  const hideMic = (inputFocused||text)?true:false

  let theID = chat&&chat.id
  const thisChatMsgs = theID && msg.messages[theID]

  const {
    replyMessageSenderAlias, 
    replyMessageContent, 
    replyColor
  } = useReplyContent(thisChatMsgs, replyUuid, extraTextContent)
  const hasReplyContent = (replyUuid || extraTextContent) ? true : false

  // const replyMessage = replyUuid&&thisChatMsgs&&thisChatMsgs.find(m=>m.uuid===replyUuid)
  // let replyMessageSenderAlias = replyMessage&&replyMessage.sender_alias
  // if(!isTribe && !replyMessageSenderAlias && replyMessage && replyMessage.sender){
  //   const sender = contacts.contacts.find(c=> c.id===replyMessage.sender)
  //   if(sender) replyMessageSenderAlias = sender.alias
  // }

  function closeReplyContent(){
    if(replyUuid) {
      setReplyUuid('')
      EE.emit('clear-reply-uuid',null)
    }
    if(extraTextContent) {
      setExtraTextContent(null)
    }
  }

  let fullHeight=textInputHeight+20
  if(hasReplyContent) fullHeight+=48
  return useObserver(()=> <>
    <View style={{...styles.spacer,height:fullHeight}} />
    <View style={{...styles.bar,height:fullHeight,bottom:0,backgroundColor:theme.main,borderColor:theme.border}}>
      {(hasReplyContent?true:false) && <ReplyContent showClose={true}
        color={replyColor}
        content={replyMessageContent}
        senderAlias={replyMessageSenderAlias}
        extraStyles={{width:'100%',marginTop:inputFocused?0:8,marginBottom:inputFocused?6:0}} 
        onClose={closeReplyContent}
      />}
      <View style={styles.barInner}>

        {!recordingStartTime && <TouchableOpacity style={{...styles.img, backgroundColor:theme.bg, borderColor:theme.border}}
          onPress={()=> setDialogOpen(true)}>
          <Icon name="plus" color="#888" size={27} />
        </TouchableOpacity>}
        {!recordingStartTime && <TextInput textAlignVertical="top"
          numberOfLines={4}
          multiline={true} blurOnSubmit={true}
          onContentSizeChange={e=>{
            let h = e.nativeEvent.contentSize.height
            if(h<44) h=44
            if(h<108) setTextInputHeight(h)
          }}
          placeholder="Message..." ref={inputRef}
          style={{...styles.input,
            marginLeft:hideMic?15:0,
            height:textInputHeight,
            maxHeight:98,
            backgroundColor:theme.bg,
            borderColor:theme.border,
            color:theme.title
          }}
          placeholderTextColor={theme.subtitle}
          onFocus={(e)=> setInputFocused(true)}
          onBlur={()=> setInputFocused(false)}
          onChangeText={e=> setText(e)}
          value={text}>
          {/* <Text>{text}</Text> */}
        </TextInput>}

        {recordingStartTime && <View style={styles.recording}>
          <RecDot />
          <View style={styles.recordSecs}>
            <Text style={{...styles.recordSecsText,color:theme.title}}>{recordSecs}</Text>
          </View>
          <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
            <Icon name="rewind" size={16} color="grey" />
            <Text style={{marginLeft:5,color:theme.subtitle}}>Swipe to cancel</Text>  
          </View>
        </View>}

        {!hideMic && <Animated.View style={{marginLeft:0,marginRight:4,zIndex:9}}
          {...panResponder.panHandlers}>
          {uploading ? 
            <View style={{width:42}}><ActivityIndicator size={20} color="grey" /></View> :
            <IconButton icon="microphone-outline" size={32} color={recordingStartTime?'white':'#666'} />
          }
        </Animated.View>}
        {recordingStartTime && <View style={styles.recordingCircle}></View>}

        {hideMic && <View style={styles.sendButtonWrap}>
          <TouchableOpacity activeOpacity={0.5} style={styles.sendButton}
            onPress={()=> sendMessage()}>
            <Icon name="send" size={17} color="white" />
          </TouchableOpacity>
        </View>}

        <AttachmentDialog
          isConversation={isConversation}
          open={dialogOpen} onClose={()=>setDialogOpen(false)}
          onPick={res=> tookPic(res)}
          onChooseCam={()=> setTakingPhoto(true)}
          doPaidMessage={()=> doPaidMessage()}
          request={()=>{
            setDialogOpen(false)
            ui.setPayMode('invoice', chat)
          }}
          send={()=>{
            setDialogOpen(false)
            ui.setPayMode('payment',chat)
          }}
          onGiphyHandler={onGiphyHandler}
        />
        <Giphy
          open={showGiphyModal}
          onClose={setShowGiphyModal}
          gifs={gifs}
          searchGif={searchGif}
          setSearchGif={setSearchGif}
          onSendGifHandler={onSendGifHandler}
          getGifsBySearch={getGifsBySearch}
        />
      </View>

      {takingPhoto && <Portal>
        <Cam onCancel={()=>setTakingPhoto(false)}
          onSnap={pic=> tookPic(pic)}
        />
      </Portal>}
    </View>
  </>)
}

const styles=StyleSheet.create({
  spacer:{
    width:'100%',
    maxWidth:'100%',
  },
  bar:{
    flex:1,
    width:'100%',
    maxWidth:'100%',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    elevation:5,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    position:'absolute',
    zIndex:999,
  },
  barInner:{
    width:'100%',
    maxWidth:'100%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  input:{
    flex:1,
    borderRadius:22,
    paddingLeft:18,
    paddingRight:18,
    borderWidth:1,
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
    width:38,maxWidth:38,
    height:38,maxHeight:38,
    borderRadius:19,
    marginTop:1,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  img:{
    width:40,height:40,
    borderRadius:20,
    marginLeft:8,
    borderColor:'#ccc',
    borderWidth:1,
    backgroundColor:'whitesmoke',
    marginRight:8,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  recordSecs:{
    flex:1,
    paddingLeft:10,
    minWidth:80,
  },
  recordSecsText:{
    fontSize:24,
  },
  recording:{
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'space-between',
    width:200,
  },
  recordingCircle:{
    height:100,
    width:100,
    backgroundColor:'#6289FD',
    position:'absolute',
    right:-15,
    top:-15,
    borderRadius:50
  }
})

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}