import React, {useState, useRef} from 'react'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, View, Text, TextInput, StyleSheet } from 'react-native'
import {IconButton, Portal} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useStores} from '../../store'
import {Chat} from '../../store/chats'
import ImgSrcDialog from '../utils/imgSrcDialog'
import Cam from '../utils/cam'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { constants } from '../../constants'

const conversation = constants.chat_types.conversation

const audioRecorderPlayer = new AudioRecorderPlayer()

export default function BottomBar({chat}:{chat: Chat}) {
  const {ui,msg} = useStores()
  const [text,setText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recordSecs, setRecordSecs] = useState('0')
  const [recording, setRecording] = useState(false)
  const [textInputHeight, setTextInputHeight] = useState(40)

  const inputRef = useRef(null)

  function sendMessage(){
    if(!text) return
    let contact_id=null
    if(!chat.id){ // if no chat (new contact)
      contact_id=chat.contact_ids.find(cid=>cid!==1)
    }
    msg.sendMessage({
      contact_id,
      text,
      chat_id: chat.id||null,
    })
    setText('')
    inputRef.current.blur()
    setInputFocused(false)
  }

  async function tookPic(img){
    setDialogOpen(false)
    setTimeout(()=>{
      setTakingPhoto(false)
      if(img&&img.uri){
        let contact_id=null
        if(!chat.id){ // if no chat (new contact)
          contact_id=chat.contact_ids.find(cid=>cid!==1)
        }
        ui.setImgViewerParams({
          contact_id,
          chat_id: chat.id||null,
          uri: img.uri,
        })
      }
    },250)
  }

  async function startRecord() {
    setRecordSecs('0')
    setRecording(true)
    console.log("BLAH BLAH",audioRecorderPlayer.startRecorder)
    const result = await audioRecorderPlayer.startRecorder()
    audioRecorderPlayer.addRecordBackListener((e) => {
      console.log('back!!!',e.current_position)
      setRecordSecs(audioRecorderPlayer.mmssss(
        Math.floor(e.current_position),
      ))
      return
    })
    console.log(result)
  }

  async function stopRecord() {
    const result = await audioRecorderPlayer.stopRecorder()
    audioRecorderPlayer.removeRecordBackListener()
    setRecordSecs('0')
    setRecording(false)
    console.log(result)
  }

  function rec(){
    if(recording){
      stopRecord()
    } else {
      startRecord()
    }
  }

  const isConversation = chat.type===conversation
  const hideArrows = (inputFocused||text)?true:false
  return useObserver(()=> <>
    <View style={{...styles.spacer,height:textInputHeight+20}} />
    <View style={{...styles.bar,height:textInputHeight+20,bottom:0}}>
      {!hideArrows && <IconButton icon="arrow-bottom-left" size={32} color="#666"
        style={{marginLeft:0,marginRight:0}} 
        disabled={!isConversation}
        onPress={()=> ui.setPayMode('invoice', chat)}     
      />}
      {!hideArrows && <TouchableOpacity style={styles.img} onPress={()=> setDialogOpen(true)}>
        <Icon name="plus" color="#888" size={27} />
      </TouchableOpacity>}
      <TextInput textAlignVertical="top"
        numberOfLines={4}
        multiline={true} blurOnSubmit={true}
        onContentSizeChange={e=>{
          let h = e.nativeEvent.contentSize.height
          if(h<44) h=44
          if(h<108) setTextInputHeight(h)
        }}
        placeholder="Message..." ref={inputRef}
        style={{...styles.input,
          marginLeft:hideArrows?15:0,
          height:textInputHeight,
          maxHeight:98
        }}
        onFocus={()=> setInputFocused(true)}
        onBlur={()=> setInputFocused(false)}
        onChangeText={e=> setText(e)}
        value={text}>
        {/* <Text>{text}</Text> */}
      </TextInput>
      {/* <IconButton icon="microphone-outline" size={32} color="#666"
        style={{marginLeft:0,marginRight:-4}}
        onPress={rec}
      /> */}
      {!hideArrows && <IconButton icon="arrow-top-right" size={32} color="#666"
        style={{marginLeft:0,marginRight:0}}
        disabled={!isConversation}
        onPress={()=> ui.setPayMode('payment',chat)}
      />}
      {hideArrows && <View style={styles.sendButtonWrap}>
        <TouchableOpacity activeOpacity={0.5} style={styles.sendButton}
          onPress={()=> sendMessage()}>
          <Icon name="send" size={17} color="white" />
        </TouchableOpacity>
      </View>}

      <ImgSrcDialog 
        open={dialogOpen} onClose={()=>setDialogOpen(false)}
        onPick={res=> tookPic(res)}
        onChooseCam={()=> setTakingPhoto(true)}
      />

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
    flexDirection:'row',
    alignItems:'center',
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
    borderColor:'#ccc',
    borderWidth:1,
    backgroundColor:'whitesmoke',
    marginRight:8,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  }
})