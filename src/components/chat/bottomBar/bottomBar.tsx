import React, {useState, useRef, useReducer} from 'react'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, View, Text, TextInput, PanResponder, Animated } from 'react-native'
import {IconButton, Portal, ActivityIndicator} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useStores} from '../../../store'
import Cam from '../../utils/cam'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { constants } from '../../../constants'
import AttachmentDialog from '../attachmentDialog'
import ReplyContent from '../msg/replyContent'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RecDot from '../recDot'
import styles from './styles'
// Helpers
import {
  tookPic,
  openImgViewer,
  startRecord,
  sendMessage,
  uploadAudioFile,
  stopRecord
} from './helpers'
import { initialState, reducer } from './reducer'

const conversation = constants.chat_types.conversation

const audioRecorderPlayer = new AudioRecorderPlayer()

export default function BottomBar({chat,pricePerMessage,tribeBots,setReplyUUID,replyUuid}) {
  const {ui,msg,contacts,meme} = useStores()
  const [recordingStartTime, setRecordingStartTime] = useState(null)

  const [state, dispatch] = useReducer(reducer, initialState)

  const inputRef = useRef(null)

  async function doPaidMessage() {
    setDialogOpenHandler(false)
    openImgViewer({msg: true}, chat, ui, pricePerMessage)
  }

  // const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState)=> true,
    onMoveShouldSetPanResponderCapture: ()=> true,
    onPanResponderStart:()=>{
      startRecord(audioRecorderPlayer, setRecordSecsHandler, setRecordingStartTime)
    },
    onPanResponderEnd:async()=>{
      await sleep(10)
      function callback(path){
        setUploadingHandler(true)
        uploadAudioFile(path, meme, sendFinalMsg, setUploadingHandler)
      }
      setRecordingStartTime(current=>{
        if(current) stopRecord(callback,sleep,audioRecorderPlayer,setRecordSecsHandler,current)
        return null
      })
    },
    onPanResponderMove: (evt, gestureState) => {
      if(gestureState.dx<-70) {
        setRecordingStartTime(current=>{
          if(current) {
            stopRecord(null, sleep,audioRecorderPlayer,setRecordSecsHandler,current) //cancel
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

  const setTakingPhotoHandler = (payload: boolean) => {
    dispatch({ type: 'setTakingPhoto', payload })
  }

  const setDialogOpenHandler = (payload: boolean) => {
    dispatch({ type: 'setDialogOpen', payload })
  }

  const setRecordSecsHandler = (payload: any) => {
    dispatch({ type: 'setRecordSecs', payload })
  }

  const setUploadingHandler = (payload: boolean) => {
    dispatch({ type: 'setUploading', payload })
  }

  const isConversation = chat.type===conversation
  const isTribe = chat.type===constants.chat_types.tribe
  const hideMic = (state.inputFocused||state.text)?true:false

  let theID = chat&&chat.id
  const thisChatMsgs = theID && msg.messages[theID]
  const replyMessage = replyUuid&&thisChatMsgs&&thisChatMsgs.find(m=>m.uuid===replyUuid)
  let replyMessageSenderAlias = replyMessage&&replyMessage.sender_alias
  if(!isTribe && !replyMessageSenderAlias && replyMessage && replyMessage.sender){
    const sender = contacts.contacts.find(c=> c.id===replyMessage.sender)
    if(sender) replyMessageSenderAlias = sender.alias
  }
  let fullHeight=state.textInputHeight+20
  if(replyMessage) fullHeight+=48
  return useObserver(()=> <>
    <View style={{...styles.spacer,height:fullHeight}} />
    <View style={{...styles.bar,height:fullHeight,bottom:0}}>
      {(replyMessage?true:false) && <ReplyContent showClose={true}
        reply_message_content={replyMessage.message_content}
        reply_message_sender_alias={replyMessageSenderAlias}
        extraStyles={{width:'100%',marginTop: state.inputFocused ? 0 : 8,marginBottom: state.inputFocused ? 6 : 0}} 
        onClose={()=> setReplyUUID('')}
      />}
      <View style={styles.barInner}>

        {!recordingStartTime && <TouchableOpacity style={styles.img} onPress={() => setDialogOpenHandler(true)}>
          <Icon name="plus" color="#888" size={27} />
        </TouchableOpacity>}
        {!recordingStartTime && <TextInput textAlignVertical="top"
          numberOfLines={4}
          multiline={true} blurOnSubmit={true}
          onContentSizeChange={e=>{
            let h = e.nativeEvent.contentSize.height
            if(h<44) h=44
            if(h<108) dispatch({ type: 'setTextInputHeight', payload: h })
          }}
          placeholder="Message..." ref={inputRef}
          style={{...styles.input,
            marginLeft:hideMic?15:0,
            height: state.textInputHeight,
            maxHeight:98
          }}
          onFocus={(e)=> dispatch({ type: 'setInputFocused', payload: true })}
          onBlur={()=> dispatch({ type: 'setInputFocused', payload: false })}
          onChangeText={(e: any) => dispatch({ type: 'setText', payload: e })}
          value={state.text}>
          {/* <Text>{text}</Text> */}
        </TextInput>}

        {recordingStartTime && <View style={styles.recording}>
          <RecDot />
          <View style={styles.recordSecs}>
            <Text style={styles.recordSecsText}>{state.recordSecs}</Text>
          </View>
          <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
            <Icon name="rewind" size={16} color="grey" />
            <Text style={{marginLeft:5}}>Swipe to cancel</Text>
          </View>
        </View>}

        {!hideMic && <Animated.View style={{marginLeft:0,marginRight:4,zIndex:9}}
          {...panResponder.panHandlers}>
          {state.uploading ?
            <View style={{width:42}}><ActivityIndicator size={20} color="grey" /></View> :
            <IconButton icon="microphone-outline" size={32} color={recordingStartTime?'white':'#666'} />
          }
        </Animated.View>}
        {recordingStartTime && <View style={styles.recordingCircle}></View>}

        {hideMic && <View style={styles.sendButtonWrap}>
          <TouchableOpacity activeOpacity={0.5} style={styles.sendButton}
            onPress={() => sendMessage(state.text, chat, tribeBots, msg, pricePerMessage, replyUuid, dispatch, setReplyUUID)}>
            <Icon name="send" size={17} color="white" />
          </TouchableOpacity>
        </View>}

        <AttachmentDialog isConversation={isConversation}
          open={state.dialogOpen} onClose={() => setDialogOpenHandler(false)}
          onPick={res=> tookPic(res, setDialogOpenHandler, setTakingPhotoHandler, { openImgViewer, chat, ui, pricePerMessage })}
          onChooseCam={()=> setTakingPhotoHandler(true)}
          doPaidMessage={()=> doPaidMessage()}
          request={()=>{
            setDialogOpenHandler(false)
            ui.setPayMode('invoice', chat)
          }}
          send={()=>{
            setDialogOpenHandler(false)
            ui.setPayMode('payment',chat)
          }}
        />
      </View>

      {state.takingPhoto && <Portal>
        <Cam onCancel={() => setTakingPhotoHandler(false)}
          onSnap={pic=> tookPic(pic, setDialogOpenHandler, setTakingPhotoHandler, { openImgViewer, chat, ui, pricePerMessage })}
        />
      </Portal>}
    </View>
  </>)
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}