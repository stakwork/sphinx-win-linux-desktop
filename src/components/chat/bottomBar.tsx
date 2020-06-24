import React, {useState, useRef, useEffect} from 'react'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, View, Text, TextInput, StyleSheet, PanResponder, Animated } from 'react-native'
import {IconButton, Portal} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useStores} from '../../store'
import Cam from '../utils/cam'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { constants } from '../../constants'
import AttachmentDialog from './attachmentDialog'
import ReplyContent from './msg/replyContent'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RecDot from './recDot'

const conversation = constants.chat_types.conversation

const audioRecorderPlayer = new AudioRecorderPlayer()

export default function BottomBar(props) {
  const {chat,pricePerMessage} = props
  const {ui,msg,contacts} = useStores()
  const [text,setText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recordSecs, setRecordSecs] = useState('0:00')
  const [recording, setRecording] = useState(false)
  const [textInputHeight, setTextInputHeight] = useState(40)
  const [recordingStartTime, setRecordingStartTime] = useState(null)

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
      console.log("SET RECORDING TRUE")
      setRecording(true)
      setRecordingStartTime(Date.now().valueOf())
    } catch(e){console.log(e)}
  }

  async function stopRecord(cb) {
    const now = Date.now().valueOf()
    console.log(now,recordingStartTime)
    if(now-recordingStartTime<1000){
      await sleep(1000)
    }
    try{
      const result = await audioRecorderPlayer.stopRecorder()
      audioRecorderPlayer.removeRecordBackListener()
      setRecordSecs('0:00')
      if(cb) cb(result)
    } catch(e){console.log(e)}
  }

  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState)=> true,
    onMoveShouldSetPanResponderCapture: ()=> true,
    onPanResponderStart:()=>{
      console.log("START")
      startRecord()
    },
    onPanResponderEnd:()=>{
      function callback(path){
        console.log(path)
        // HERE ! upload file and send msg
      }
      console.log("END")
      setRecording(current=>{
        console.log("IS RECORINDG?",current)
        if(current) stopRecord(callback)
        return false
      })
      setRecordingStartTime(null)
    },
    onPanResponderMove: (evt, gestureState) => {
      if(gestureState.dx<-70) {  
        setRecording(current=>{
          if(current) {
            stopRecord(null) //cancel
            ReactNativeHapticFeedback.trigger("impactLight", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: true
            })
          }
          return false
        })
        setRecordingStartTime(null)
      }
    },
    onPanResponderRelease: (evt, gestureState) => {},
  }), []);

  const isConversation = chat.type===conversation
  const isTribe = chat.type===constants.chat_types.tribe
  const hideMic = (inputFocused||text)?true:false

  let theID = chat&&chat.id
  const thisChatMsgs = theID && msg.messages[theID]
  const replyMessage = props.replyUuid&&thisChatMsgs&&thisChatMsgs.find(m=>m.uuid===props.replyUuid)
  let replyMessageSenderAlias = replyMessage&&replyMessage.sender_alias
  if(!isTribe && !replyMessageSenderAlias && replyMessage.sender){
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

        {!recording && <TouchableOpacity style={styles.img} onPress={()=> setDialogOpen(true)}>
          <Icon name="plus" color="#888" size={27} />
        </TouchableOpacity>}
        {!recording && <TextInput textAlignVertical="top"
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

        {recording && <View style={styles.recording}>
          <RecDot />
          <View style={styles.recordSecs}>
            <Text style={styles.recordSecsText}>{recordSecs}</Text>
          </View>
          <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
            <Icon name="rewind" size={16} color="grey" />
            <Text style={{marginLeft:5}}>Swipe to cancel</Text>  
          </View>
        </View>}

        {!hideMic && <Animated.View style={{marginLeft:0,marginRight:4}}
          {...panResponder.panHandlers}>
          <IconButton icon="microphone-outline" size={32} color="#666" />
        </Animated.View>}

        {hideMic && <View style={styles.sendButtonWrap}>
          <TouchableOpacity activeOpacity={0.5} style={styles.sendButton}
            onPress={()=> sendMessage()}>
            <Icon name="send" size={17} color="white" />
          </TouchableOpacity>
        </View>}

        <AttachmentDialog 
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
  }
})

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}