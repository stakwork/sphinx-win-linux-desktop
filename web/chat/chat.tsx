import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Head from './head'
import Foot from './foot'
import theme from '../theme'
import Msg from './msg'
import { constants } from '../../src/constants'
import { useStores, hooks } from '../../src/store'
import { useObserver } from 'mobx-react-lite'
import Frame from './frame'
import { CircularProgress } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';
import Dropzone from 'react-dropzone'
import { uploadFile } from '../utils/meme'
import Bots from './bots'
import MsgMenu from './msgMenu'
import {useHasReplyContent} from '../../src/store/hooks/chat'
import Pod from './pod'
import {StreamPayment} from '../../src/store/feed'
import Anim from './anim'
const { useMsgs } = hooks

const headHeight = 65

export type RouteStatus = 'active' | 'inactive' | null

function Chat() {
  const { chats, ui, msg } = useStores()
  const [appMode, setAppMode] = useState(true)
  const [pricePerMessage, setPricePerMessage] = useState(0)
  const [tribeBots, setTribeBots] = useState([])
  const [status,setStatus] = useState<RouteStatus>(null)
  let footHeight = 65

  // function joinEvanTest(){
  //   chats.joinTribe({
  //     name:'Evan Test',
  //     uuid:'XyyNsiAM4pbbX4vjtYz2kcFye-h4dd9Nd2twi2Az8gGDQdIbM3HU1WV3XoASXLedCaVpl0YrAvjvBpAPt9ZB0-rpV4Y1',
  //     group_key:'MIIBCgKCAQEA8oGCKreUM09hDXKDoe3laNZY9fzyNMUUZMt+yC5WhoUIzvW1PtRJ6AWH+xwAK3nD+sUK8LP6y9nNSK1z5SNvFem0fmEq1JBPGEUMlqIA4CUeCbJB7cUan1s4DWDosEQBY/fiQNslNKWko97dEyjGEEi0KJkE2kNTgsmpEPfH4+V886Ei4/NP7qTR/3H4ohC5MlUiXyv/Ah1GuhmAM8Hu57fdVe26AJ1jXFkMikC/+84ysseycoQZmCLDvLd6R0nnQ/LOafV2vCC36HChSzylU7qkFHkdbUg6GXO0nxk6dzGFrJpjppJzhrRxmfrL+9RcsuMXkDAQFUZg8wAipPXmrwIDAQAB',
  //     host:'tribes.sphinx.chat',
  //     amount:10,
  //     img:'',
  //     owner_alias:'Evan',
  //     owner_pubkey:'02290714deafd0cb33d2be3b634fc977a98a9c9fa1dd6c53cf17d99b350c08c67b',
  //     is_private:true,
  //   })
  // }

  return useObserver(() => {

    if (useHasReplyContent()) footHeight = 120
    const chat = ui.selectedChat

    function onBoost(sp:StreamPayment){
      if(!(chat&&chat.id)) return
      msg.sendMessage({
        contact_id:null,
        text:`boost::${JSON.stringify(sp)}`,
        chat_id: chat.id||null,
        amount: pricePerMessage,
        reply_uuid:''
      })
    }

    useEffect(() => {
      setPricePerMessage(0)
      setStatus(null)
      setTribeBots([])
      // console.log('user.currentIP',user.currentIP)
      if (!chat) {
        ui.setFeedURL(null)
        ui.setApplicationURL(null)
        return
      }
      (async () => {
        setAppMode(true)
        let isAppURL = false
        let isFeedURL = false
        if (chat.type === constants.chat_types.tribe) {
          ui.setLoadingChat(true)
          const params = await chats.getTribeDetails(chat.host, chat.uuid)
          if (params) {
            setPricePerMessage(params.price_per_message + params.escrow_amount)
            if (params.app_url) {
              isAppURL = true
              ui.setApplicationURL(params.app_url)
            }
            if (params.feed_url) {
              ui.setFeedURL(params.feed_url)
              isFeedURL = true
            }
            if (params.bots && Array.isArray(params.bots)) {
              setTribeBots(params.bots)
            }
            ui.setLoadingChat(false)
          }
        }
        if (!isFeedURL) {
          ui.setFeedURL(null)
        }
        if (!isAppURL) {
          ui.setApplicationURL('')
        }
        const r = await chats.checkRoute(chat.id)
        if(r && r.success_prob && r.success_prob>0.01) {
          setStatus('active')
        } else {
          setStatus('inactive')
        }
      })()
    }, [chat])

    return <Section style={{ background: theme.deep }}>
      <Inner>
        <Head height={headHeight} setAppMode={setAppMode} appMode={appMode} 
          pricePerMessage={pricePerMessage} status={status}
        />
        <ChatContent appMode={appMode} footHeight={footHeight} 
          pricePerMessage={pricePerMessage} 
        />
        <Foot height={footHeight} tribeBots={tribeBots}
          pricePerMessage={pricePerMessage}
        />
      </Inner>
      {ui.feedURL && 
        <Pod url={ui.feedURL} chat={chat}
          onBoost={onBoost}
        />
      }
    </Section>
  })
}

const Inner = styled.div`
  display:flex;
  flex-direction:column;
  flex:1;
`


function ChatContent({ appMode, footHeight, pricePerMessage }) {
  const { contacts, ui, chats, meme, msg, user } = useStores()
  const chat = ui.selectedChat
  const [alert, setAlert] = useState(``)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuMessage, setMenuMessage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [msgCount, setMsgCount] = useState(20)

  async function dropzoneUpload(files) {
    const file = files[0]
    const server = meme.getDefaultServer()
    setUploading(true)
    const r = await uploadFile(file, file.type, server.host, server.token, 'Image.jpg')
    // console.log('pricePerMessage',pricePerMessage)
    await msg.sendAttachment({
      contact_id: null, chat_id: chat.id,
      muid: r.muid,
      media_key: r.media_key,
      media_type: file.type,
      text: '',
      price: 0,
      amount: pricePerMessage||0
    })
    setUploading(false)
  }

  const handleMenuClick = (event, m) => {
    setAnchorEl(event.currentTarget);
    setMenuMessage(m);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMessage(null);
  };

  function onCopy(word) {
    setAlert(`${word} copied to clipboard`)
    setTimeout(() => {
      setAlert(``)
    }, 2000);
  }

  return useObserver(() => {
    const chat = ui.selectedChat
    const appURL = ui.applicationURL

    const msgs = useMsgs(chat) || []
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const h = `calc(100% - ${headHeight + footHeight}px)`

    useEffect(() => {
      setMsgCount(20)
    }, [(chat && chat.id)])

    if (ui.loadingChat) {
      return <LoadingWrap style={{ maxHeight: h, minHeight: h }}>
        <CircularProgress size={32} style={{ color: 'white' }} />
      </LoadingWrap>
    }
    if (ui.showBots) {
      return <Bots />
    }

    const shownMsgs = msgs.slice(0, msgCount)

    function handleScroll(e) {
      if (e.target.scrollTop === 0) {
        setMsgCount(c => c + 20)
      }
    }

    return (
      <Wrap h={h}>
        <Dropzone disabled={!chat} noClick={true} multiple={false} onDrop={dropzoneUpload}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div style={{ flex: 1 }} {...getRootProps()}>
              <input {...getInputProps()} />
              {(isDragActive || uploading) && <DropZoneContainer h={h}>
                <DropZoneInner>
                  {uploading ? 'File Uploading...' : 'Drag Image or Video here'}
                </DropZoneInner>
              </DropZoneContainer>}
              <Layer show={!appMode} style={{ background: theme.deep }} >

                <MsgList className="msg-list" onScroll={handleScroll} id='chat-content'>
                  {shownMsgs.map((m, i) => {
                    let senderAlias = ''
                    const sender = contacts.contacts.find(c => c.id === m.sender)
                    const senderPhoto = !isTribe && (sender && sender.photo_url) || ''
                    if (isTribe) {
                      senderAlias = m.sender_alias
                    } else {
                      senderAlias = sender && sender.alias
                    }
                    if (m.dateLine) {
                      return <DateLine key={'date' + i} dateString={m.dateLine} />
                    }
                    if(!m.chat) m.chat = chat
                    return <Msg key={m.id} {...m} senderAlias={senderAlias} senderPhoto={senderPhoto} 
                      handleClick={e => handleMenuClick(e, m)} handleClose={handleMenuClose} 
                      onCopy={onCopy}
                    />
                  })}
                </MsgList>
                {alert && <Alert style={{ position: 'absolute', bottom: 20, left: 'calc(50% - 90px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
                <MsgMenu anchorEl={anchorEl} menuMessage={menuMessage} isMe={isMe}
                  handleMenuClose={handleMenuClose} onCopy={onCopy}
                />
              </Layer>
              {appURL && <Layer show={appMode} style={{ background: theme.deep, height: 'calc(100% + 63px)' }}>
                <Frame url={appURL} />
              </Layer>}
            </div>
          )}
        </Dropzone>
        <Anim />
      </Wrap>
    )
  })
}

function DateLine({ dateString }) {
  return <DateWrap>
    <BackLine />
    <DateString style={{ background: theme.deep }}>
      {dateString}
    </DateString>
  </DateWrap>
}

const DropZoneContainer = styled.div`
  position: absolute;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  outline: none;
  height: 100%;
  width: 100%;
  opacity: 0.5;
  z-index: 102;
`;

const DropZoneInner = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px;
  border-width: 3px;
  border-radius: 15px;
  height:100%;
  min-width: calc(100% - 100px);
  max-width: calc(100% - 100px);
  border-style: dashed;
  color: white;
  transition: border .24s ease-in-out;
`

const Wrap = styled.div`
  flex:1;
  display: flex;
  padding-right:3px;
  position: relative;
  min-height: ${p => p.h};
  max-height: ${p => p.h};
  width:100%;
  position: relative;  
  z-index:99;
`
const Section = styled.section`
  height:100%;
  flex:1;
  position:relative;
  z-index:99;
  display:flex;
  flex-direction:row;
`
const MsgList = styled.div`
  overflow:auto;
  flex:1;
  display: flex;
  flex-direction: column-reverse;
  max-height:100%;
`
const Layer = styled.div`
  flex:1;
  display: flex;
  padding-right:3px;
  position: absolute;
  width:100%;
  height:100%;
  z-index: ${p => p.show ? 101 : 99};
`
const DateWrap = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  margin:8px;
  position:relative;
  position: relative;
  padding: 0 7px;
`
const DateString = styled.div`
  height:14px;
  font-size:14px;
  color:grey;
  position: relative;
  padding: 0 8px;
`
const BackLine = styled.div`
  background:grey;
  height:1px;
  width:96%;
  position:absolute;
  top:8px;
  left:2%;
`
const LoadingWrap = styled.div`
  flex:1;
  display: flex;
  align-items:center;
  justify-content:center;
`

export default Chat

function isMe(menuMessage) {
  return menuMessage && menuMessage.sender === 1
}
