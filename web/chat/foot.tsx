import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import theme from '../theme'
import { constants } from '../../src/constants'
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import BlinkingButton from '@material-ui/core/IconButton';
import MicIcon from '@material-ui/icons/Mic';
import Check from '@material-ui/icons/Check'
import Close from '@material-ui/icons/Close'
import CloseButton from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import { useStores } from '../../src/store'
import { useObserver } from 'mobx-react-lite'
import moment from 'moment'
import { ReactMic } from '@cleandersonlobo/react-mic';
import InsertEmoticonButton from '@material-ui/icons/InsertEmoticon';
import Popover from '@material-ui/core/Popover';
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { uploadFile } from '../utils/meme'
import { calcBotPrice } from '../../src/store/hooks/chat'
import { useReplyContent } from '../../src/store/hooks/chat'
import ReactGiphySearchbox from 'react-giphy-searchbox'

export default function Foot({ height, messagePrice, tribeBots }) {
  const { ui, msg, meme, details } = useStores()
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [record, setRecord] = useState(false)
  const [uploading, setUploading] = useState(false)

  return useObserver(() => {
    const chat = ui.selectedChat

    useEffect(() => {
      if (recording) {
        setRecord(true)
      }
    }, [recording])

    async function sendGif(amount: number){
      const params = ui.imgViewerParams
      const gifJSON = JSON.stringify({
        id: params.id,
        url: params.data,
        aspect_ratio: params.aspect_ratio,
        text: text,
      })
      const b64 = btoa(gifJSON)
      let contact_id = chat.contact_ids.find(cid => cid !== 1)
      await msg.sendMessage({
        contact_id, chat_id: chat.id,
        text: 'giphy::'+b64,
        reply_uuid: '',
        amount: amount || 0,
      })
      ui.setImgViewerParams(null)
      setText('')
    }

    function sendMessage() {
      if (!text) return
      let contact_id = chat.contact_ids.find(cid => cid !== 1)
      let { price, failureMessage } = calcBotPrice(tribeBots, text)
      if (failureMessage) {
        return alert(failureMessage)
      }
      if(price>details.balance) {
        return alert('Not enough balance')
      }

      if(ui.imgViewerParams && ui.imgViewerParams.type === 'image/gif'){
        return sendGif(messagePrice + price)
      }

      let txt = text
      if (ui.extraTextContent) {
        const { type, ...rest } = ui.extraTextContent
        txt = type + '::' + JSON.stringify({ ...rest, text })
      }
      msg.sendMessage({
        contact_id,
        text: txt,
        chat_id: chat.id || null,
        amount: (messagePrice + price) || 0, // 5, // CHANGE THIS
        reply_uuid: ui.replyUUID || ''
      })
      setText('')
      if (ui.replyUUID) ui.setReplyUUID('')
      if (ui.extraTextContent) ui.setExtraTextContent(null)
    }

    let [count, setCount] = useState(0);

    useInterval(() => {
      // Your custom logic here
      setCount(count + 1);
    }, recording ? 1000 : null);

    function duration(seconds) {
      var start = moment(0)
      var end = moment(seconds * 1000)
      let diff = end.diff(start);
      return moment.utc(diff).format("m:ss");
    }

    async function onStop(res) {
      const blob = res.blob
      const file = new File([blob], 'Audio.wav', { type: blob.type });
      const server = meme.getDefaultServer()
      setUploading(true)
      const r = await uploadFile(file, blob.type, server.host, server.token, 'Audio.wav')
      await msg.sendAttachment({
        contact_id: null, chat_id: chat.id,
        muid: r.muid,
        media_key: r.media_key,
        media_type: blob.type,
        text: '',
        price: 0,
        amount: 0
      })
      setUploading(false)
      setRecording(false)
      setCount(0)
    }

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const msgs = chat && msg.messages[chat.id]

    const { replyMessageSenderAlias, replyMessageContent, replyColor } = useReplyContent(msgs, ui.replyUUID, ui.extraTextContent)

    const [showGiphy, setShowGiphy] = useState(false)
    function handleGiphy() {
      setShowGiphy(true)
    }

    if (ui.showBots) {
      return <></>
    }
    if (recording) {

      return <MicWrap style={{ background: theme.bg, height }}>
        <Blinker>
          <BlinkingButton style={{ height: 10, padding: 7, backgroundColor: '#ea7574', marginTop: -1 }} />
        </Blinker>
        <WaveWrap>
          <ReactMic
            className="sound-wave"
            record={record}
            backgroundColor={theme.bg}
            onStop={onStop}
            // onStart={onStart}
            strokeColor="#ffffff"
          />
        </WaveWrap>
        <div style={{ color: 'white', height: 25, marginTop: 8, marginRight: 10 }}>
          {duration(count)}
        </div>
        <IconButton style={{ width: 39, height: 39, marginRight: 17, backgroundColor: '#ea7574', opacity: uploading ? 0.8 : 1 }}
          onClick={() => { setRecord(false), setRecording(false), setCount(0) }}
          disabled={uploading}>
          <Close style={{ color: 'white', fontSize: 30, borderRadius: "50%" }} />
        </IconButton>
        <IconButton style={{ width: 39, height: 39, marginRight: 17, backgroundColor: '#47ca97', opacity: uploading ? 0.8 : 1 }}
          onClick={() => setRecord(false)} disabled={uploading}>
          <Check style={{ color: 'white', fontSize: 30, borderRadius: "50%" }} />
        </IconButton>
      </MicWrap>
    }

    return <Wrap style={{ background: theme.bg, height }}>
      {(replyMessageContent && replyMessageSenderAlias) &&
        <ReplyMsg color={replyColor || 'grey'}>
          <ReplyMsgText>
            <span style={{ color: 'white' }}>{replyMessageSenderAlias}</span>
            <span style={{ color: '#809ab7', marginTop: 5 }}>{replyMessageContent}</span>
          </ReplyMsgText>
          <CloseButton style={{ cursor: 'pointer' }} onClick={() => {
            ui.setReplyUUID(null)
            ui.setExtraTextContent(null)
          }} />
        </ReplyMsg>}
      {showGiphy &&
        <GiphyWrap>
          <ReactGiphySearchbox
            style={{ position: 'absolute' }}
            apiKey="cnc84wQZqQn2vsWeg4sYK3RQJSrYPAl7"
            onSelect={item => {
              const data = item.images.original.url
              const height = parseInt(item.images.original.height) || 200
              const width = parseInt(item.images.original.width) || 200
              ui.setImgViewerParams({ 
                data,
                aspect_ratio: width/height,
                id: item.id,
                type: 'image/gif' })
              setShowGiphy(false)}

            }
          />
          <CloseWrap onClick={()=>setShowGiphy(false)}>
            CLOSE <CloseButton />
          </CloseWrap>
          </GiphyWrap>}
        <InnerWrap>
          <IconButton style={{ pointerEvents: chat && chat.type === constants.chat_types.conversation ? "auto" : "none", cursor: 'pointer', height: 30, width: 30, marginLeft: 10, backgroundColor: '#618af8' }}
            onClick={() => ui.setSendRequestModal(chat)}>
            <AddIcon style={{ color: chat ? '#ffffff' : '#b0c4ff', fontSize: 22 }} />
          </IconButton>
          <img src="/static/GIPHY Icon DarkBackgrounds 27.png" onClick={chat && handleGiphy} style={{cursor: chat ? 'pointer' : 'auto', marginLeft: '15px', filter: chat ? 'grayscale(0%)' : 'grayscale(75%)'}} />
          <InsertEmoticonButton style={{ pointerEvents: chat ? "auto" : "none", cursor: 'pointer', marginLeft: 10, color: chat ? "#8f9ca9" : "#2a3540", fontSize: 30 }}
            aria-describedby={id} onClick={handleClick} />
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Picker showPreview={false} showSkinTones={false} onSelect={emoji => setText(text + emoji.native)} />
          </Popover>
          <Input value={text} onChange={e => setText(e.target.value)}
            placeholder="Message" style={{ background: theme.extraDeep, fontSize: 18 }}
            disabled={!chat}
            onKeyPress={e => {
              if (e.key === 'Enter') { e.preventDefault(), sendMessage() }
            }}
          ></Input>
          <IconButton style={{
            width: 39, height: 39, marginRight: 10, marginLeft: 10, backgroundColor: '#618af8'
          }} disabled={!chat || !text} onClick={sendMessage}>
            <SendIcon style={{ color: chat ? '#ffffff' : '#b0c4ff', fontSize: 22 }} />
          </IconButton>
          <IconButton style={{
            width: 39, height: 39, marginRight: 10,
            backgroundColor: 'transparent'
          }} disabled={!chat} onClick={() => setRecording(true)}>
            <MicIcon style={{ color: chat ? '#8f9ca9' : '#2a3540', fontSize: 30 }} />
          </IconButton>
        </InnerWrap>
    </Wrap>
  })
}

const CloseWrap = styled.div`
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e3145;
    cursor: pointer;
    font-weight: bold;
`

const GiphyWrap = styled.div`
    position: absolute;
    transform: translateY(-385px) translateX(50px);
    padding: 10px;
    background-color: #3d6189;
    border-radius: 8px;
`

const Blinker = styled.div`
  animation:blink 1.2s infinite;

@keyframes blink {
  from, to { opacity: 1 }
  50% { opacity: 0 }
}
`
const InnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content:center;
  height: 65px;
`
const ReplyMsg = styled.div`
  border-left: 5px solid ${p => p.color};
  width: calc(100% - 30px);
  height: 50px;
  margin: 10px 15px 5px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ReplyMsgText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin-left: 10px;
  font-size: 13px;
`

const MicWrap = styled.div`
  width:100%;
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:flex-end;
  box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.45);

  & .sound-wave{
    margin-top: 5px;
    clip-path: inset(20px 0px 0px 40px);
  }
`

const WaveWrap = styled.div`
 margin-right: 5px;
 margin-left: -35px;
 max-width: 150px;
 overflow: hidden;
`

const Wrap = styled.div`
  width:100%;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.45);
  position:relative;
  z-index:100;
`
const Input = styled.textarea`
  font-family: 'Roboto', sans-serif;
  max-width:calc(100% - 64px);
  width:100%;
  height:42px;
  border:none;
  outline:none;
  border-radius:32px;
  font-size:14px;
  padding-left:24px;
  padding-right:24px;
  color:white;
  margin-left:8px;
  resize: none;
  white-space: normal;
  text-align: justify;
  padding: 10px;
`
function useInterval(callback, delay) {
  const savedCallback: any = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
