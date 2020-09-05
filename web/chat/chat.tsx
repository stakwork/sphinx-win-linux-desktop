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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ReplyIcon from '@material-ui/icons/Reply';
import LinkIcon from '@material-ui/icons/Link';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Dropzone from 'react-dropzone'
import { uploadFile } from '../utils/meme'
import Bots from './bots'
import { useHasLink } from './msg/hooks'
const { useMsgs } = hooks

var link = null

var link = null

const headHeight = 65
const footHeight = 65
function Chat() {
  const [appMode, setAppMode] = useState(true)
  return <Section style={{ background: theme.deep }}>
    <Head height={headHeight} setAppMode={setAppMode} appMode={appMode} />
    <ChatContent appMode={appMode} setAppMode={setAppMode} />
    <Foot height={footHeight} />
  </Section>
}

function ChatContent({ appMode, setAppMode }) {
  const { contacts, ui, chats, meme, msg, user } = useStores()
  const chat = ui.selectedChat
  const [alert, setAlert] = useState(``)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuMessage, setMenuMessage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function dropzoneUpload(files) {
    const file = files[0]
    const server = meme.getDefaultServer()
    setUploading(true)
    const r = await uploadFile(file, file.type, server.host, server.token, 'Image.jpg')
    await msg.sendAttachment({
      contact_id: null, chat_id: chat.id,
      muid: r.muid,
      media_key: r.media_key,
      media_type: file.type,
      text: '',
      price: 0,
      amount: 0
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

    useEffect(() => {
      if (!chat) return
      (async () => {
        setAppMode(true)
        let isAppURL = false
        if (chat.type === constants.chat_types.tribe) {
          ui.setLoadingChat(true)
          const params = await chats.getTribeDetails(chat.host, chat.uuid)
          if (params && params.app_url) {
            isAppURL = true
            ui.setApplicationURL(params.app_url)
          }
          ui.setLoadingChat(false)
        }
        if (!isAppURL) {
          ui.setApplicationURL('')
        }
      })()
    }, [chat])
    const link = useHasLink(menuMessage)

    async function deleteMessage(){
      if(deleting) return
      setDeleting(true)
      await msg.deleteMessage(menuMessage.id)
      setDeleting(false)
      handleMenuClose()
    }

    const msgs = useMsgs(chat) || []
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const h = `calc(100% - ${headHeight + footHeight}px)`
    if (ui.loadingChat) {
      return <LoadingWrap style={{ maxHeight: h, minHeight: h }}>
        <CircularProgress size={32} style={{ color: 'white' }} />
      </LoadingWrap>
    }
    if (chat && ui.botsChatId) {
      return <Bots chat={chat} />
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
              <Layer show={!appMode} style={{ background: theme.deep }}>
                <MsgList className="msg-list">
                  {msgs.map((m, i) => {
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

                    return <Msg key={m.id} {...m} senderAlias={senderAlias} senderPhoto={senderPhoto} handleClick={e => handleMenuClick(e, m)} handleClose={handleMenuClose} />
                  })}
                </MsgList>
                {alert && <Alert style={{ position: 'absolute', bottom: 20, left: 'calc(50% - 90px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  getContentAnchorEl={null}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: isMe(menuMessage) ? 'left' : 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: isMe(menuMessage) ? 'right' : 'left',
                  }}
                  PaperProps={{
                    style: {
                      backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep
                    },
                  }}>
                  <MenuItem onClick={() => { navigator.clipboard.writeText(menuMessage.message_content), handleMenuClose(), onCopy('Text') }} style={{ fontSize: 14, color: 'white', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'white', marginRight: 8 }}>
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>Copy Text
            </MenuItem>
                  { link ?
                    <MenuItem onClick={() => { navigator.clipboard.writeText(link), handleMenuClose(), onCopy('Link') }} style={{ fontSize: 14, color: 'white', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
                      <LinkIcon style={{ fontSize: 'medium', marginRight: 8 }} />Copy Link
            </MenuItem> : <div></div>}
                  {/* <MenuItem onClick={handleMenuClose} style={{ fontSize: 14, color: 'white', backgroundColor: isMe ? theme.highlight : theme.extraDeep }}>
                    <ReplyIcon style={{ fontSize: 'medium', marginRight: 8 }} />Reply
                  </MenuItem> */}
                  {isMe(menuMessage) ?
                    <MenuItem onClick={deleteMessage} style={{ fontSize: 14, color: '#fe5251', backgroundColor: theme.highlight }}>
                      <DeleteForeverIcon style={{ color: 'red', fontSize: 'medium', marginRight: 8 }} />
                      {deleting ? 'Deleting...' : 'Delete Message' }
            </MenuItem> : <div></div>}
                </Menu>
              </Layer>
              {appURL && <Layer show={appMode} style={{ background: theme.deep, height: 'calc(100% + 63px)' }}>
                <Frame url={appURL} />
              </Layer>}
            </div>
          )}
        </Dropzone>
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
`
const Section = styled.section`
  height:100%;
  flex:1;
  position:relative;
  z-index:99;
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
