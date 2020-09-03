import React, {useState, useRef, useEffect} from 'react'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, View, Text, TextInput, StyleSheet, PanResponder, Animated } from 'react-native'
import {IconButton, Portal, ActivityIndicator} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useStores} from '../../store'
import Cam from '../utils/cam'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { constants } from '../../constants'
import AttachmentDialog from './attachmentDialog'
import ReplyContent from './msg/replyContent'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RecDot from './recDot'
import RNFetchBlob from 'rn-fetch-blob'
import * as e2e from '../../crypto/e2e'
import {randString} from '../../crypto/rand'
import { fetchGifs } from './helpers'
import { Giphy } from './components';

const conversation = constants.chat_types.conversation

const audioRecorderPlayer = new AudioRecorderPlayer()

export default function BottomBar(props) {
  const {chat,pricePerMessage} = props
  const {ui,msg,contacts,meme} = useStores()
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

  const inputRef = useRef(null)

  function sendMessage(){
    if(!text) return
    let contact_id=chat.contact_ids.find(cid=>cid!==1)
    msg.sendMessage({
      contact_id,
      text,
      chat_id: chat.id||null,
      amount:pricePerMessage||0,
      reply_uuid:props.replyUuid||''
    })
    setText('')
    props.setReplyUUID('')
    // inputRef.current.blur()
    // setInputFocused(false)
  }

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
      await audioRecorderPlayer.startRecorder()
      audioRecorderPlayer.addRecordBackListener((e) => {
        const str = audioRecorderPlayer.mmssss(
          Math.floor(e.current_position),
        )
        const idx = str.lastIndexOf(':')
        setRecordSecs(str.substr(1,idx-1))
      })
      setRecordingStartTime(Date.now().valueOf())
    } catch(e){console.log(e)}
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
    } catch(e){console.log(e)}
  }

  // const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState)=> true,
    onMoveShouldSetPanResponderCapture: ()=> true,
    onPanResponderStart:()=>{
      startRecord()
    },
    onPanResponderEnd:async()=>{
      await sleep(10)
      function callback(path){
        setUploading(true)
        uploadAudioFile(path)
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
              ignoreAndroidSystemSettings: true
            })
          }
          return null
        })
      }
    },
    onPanResponderRelease: (evt, gestureState) => {},
  }), []);

  async function uploadAudioFile(uri){
    const pwd = await randString(32)
    const server = meme.getDefaultServer()
    if(!server) return
    if(!uri) return

    const type = 'audio/mp4'
    const filename = 'sound.mp4'
    let enc = await e2e.encryptFile(uri, pwd)
    RNFetchBlob.fetch('POST', `https://${server.host}/file`, {
      Authorization: `Bearer ${server.token}`,
      'Content-Type': 'multipart/form-data'
    }, [{
        name:'file',
        filename,
        type: type,
        data: enc,
      }, {name:'name', data:filename}
    ])
    // listen to upload progress event, emit every 250ms
    .uploadProgress({ interval : 250 },(written, total) => {
        console.log('uploaded', written / total)
        // setUploadedPercent(Math.round((written / total)*100))
    })
    .then(async (resp) => {
      let json = resp.json()
      console.log('done uploading',json)
      await sendFinalMsg({
        muid:json.muid,
        media_key:pwd,
        media_type:type,
      })
      setUploading(false)
    })
    .catch((err) => {
      console.log(err)
    })
  }

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
    const gifs = await fetchGifs(searchGif);
    if (gifs.meta.status === 200) setGifs(gifs.data);
    setDialogOpen(false);
    setShowGiphyModal(true);
  }

  async function getGifsBySearch() {
    const gifs = await fetchGifs(searchGif);
    if (gifs.meta.status === 200) setGifs(gifs.data);
  };

  async function onSendGifHandler(gif: any) {
    setShowGiphyModal(false);
    const { config, fs } = RNFetchBlob;
    const DownloadDir = fs.dirs.DownloadDir;
    // configuration to download gif
    const options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${DownloadDir}/gif-${Math.floor(new Date().getTime() + new Date().getSeconds() / 2)}.gif`,
        description: 'Gif',
      },
    };
    // download to local storage selected gif
    config(options)
      .fetch('GET', gif.images.original.url)
      .then(res => {
        const localDir = `file://${res.data}`;
        const url = gif.images.original.url;
        tookPic({ uri: localDir })
      });
  };

  const isConversation = chat.type===conversation
  const isTribe = chat.type===constants.chat_types.tribe
  const hideMic = (inputFocused||text)?true:false

  let theID = chat&&chat.id
  const thisChatMsgs = theID && msg.messages[theID]
  const replyMessage = props.replyUuid&&thisChatMsgs&&thisChatMsgs.find(m=>m.uuid===props.replyUuid)
  let replyMessageSenderAlias = replyMessage&&replyMessage.sender_alias
  if(!isTribe && !replyMessageSenderAlias && replyMessage && replyMessage.sender){
    const sender = contacts.contacts.find(c=> c.id===replyMessage.sender)
    if(sender) replyMessageSenderAlias = sender.alias
  }
  let fullHeight=textInputHeight+20
  if(replyMessage) fullHeight+=48
  return useObserver(()=> <>
    <View style={{...styles.spacer,height:fullHeight}} />
    <View style={{...styles.bar,height:fullHeight,bottom:0}}>
      {(replyMessage?true:false) && <ReplyContent showClose={true}
        reply_message_content={replyMessage.message_content}
        reply_message_sender_alias={replyMessageSenderAlias}
        extraStyles={{width:'100%',marginTop:inputFocused?0:8,marginBottom:inputFocused?6:0}} 
        onClose={()=> props.setReplyUUID('')}
      />}
      <View style={styles.barInner}>

        {!recordingStartTime && <TouchableOpacity style={styles.img} onPress={()=> setDialogOpen(true)}>
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
            maxHeight:98
          }}
          onFocus={(e)=> setInputFocused(true)}
          onBlur={()=> setInputFocused(false)}
          onChangeText={e=> setText(e)}
          value={text}>
          {/* <Text>{text}</Text> */}
        </TextInput>}

        {recordingStartTime && <View style={styles.recording}>
          <RecDot />
          <View style={styles.recordSecs}>
            <Text style={styles.recordSecsText}>{recordSecs}</Text>
          </View>
          <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
            <Icon name="rewind" size={16} color="grey" />
            <Text style={{marginLeft:5}}>Swipe to cancel</Text>  
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
    backgroundColor:'white',
    elevation:5,
    borderWidth: 2,
    borderColor: '#ddd',
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
    borderColor:'#ccc',
    backgroundColor:'whitesmoke',
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