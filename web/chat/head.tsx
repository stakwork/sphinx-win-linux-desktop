import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStores } from '../../src/store'
import { useObserver } from 'mobx-react-lite'
import theme from '../theme'
import Avatar from '../utils/avatar'
import PublicIcon from '@material-ui/icons/Public';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import IconButton from '@material-ui/core/IconButton';
import { constants } from '../../src/constants'
import ChatIcon from '@material-ui/icons/Chat';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { SvgIcon } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import PhoneIcon from '@material-ui/icons/Phone'
import LockIcon from '@material-ui/icons/Lock';

export default function Head({ height, appMode, appURL, setAppMode, pricePerMessage, status }) {
  const [showURL, setShowURL] = useState(false)
  const [URL, setURL] = useState('')
  const { contacts, ui, msg } = useStores()

  return useObserver(() => {
    const chat = ui.selectedChat
    const ownerPubkey = (chat && chat.owner_pubkey) || ''
    const owner = contacts.contacts.find(c => c.id === 1)
    const isTribeOwner = owner && owner.public_key === ownerPubkey

    function goToURL() {
      ui.setApplicationURL(URL)
    }
    function clearURL() {
      setURL('')
      ui.setApplicationURL('')
    }
    function openJitsi() {
      ui.setStartJitsiParams({pricePerMessage})
    }

    useEffect(() => {
      if (chat) {
        setURL('')
        setShowURL(false)
      }
    }, [chat])

    let photoURL = chat && chat.photo_url
    if (chat && chat.type === constants.chat_types.conversation) {
      const cid = chat.contact_ids.find(id => id !== 1)
      const contact = contacts.contacts.find(c => c.id === cid)
      if (contact && contact.photo_url) {
        photoURL = contact.photo_url
      }
    }

    function viewContact(){
      if(chat && chat.type === constants.chat_types.conversation) {
        const cid = chat.contact_ids.find(id => id !== 1)
      const contact = contacts.contacts.find(c => c.id === cid)
      ui.setViewContact(contact)
      }

    }

    return <Wrap style={{ background: theme.bg, height }}>
      {!chat && !showURL && <Placeholder>
        Open a conversation to start using Sphinx
      </Placeholder>}
      {chat && <Inner>
        <Left>
          <AvatarWrap>
            <Avatar big photo={photoURL} alias={chat.name} />
          </AvatarWrap>
          <ChatInfo>
            <NameWrap>
              <Name onClick={viewContact} style={{cursor:(chat && chat.type === constants.chat_types.conversation) ? 'pointer' : 'auto'}}>{chat.name}</Name>
              {status && chat.type!==constants.chat_types.group && <Tooltip title={status==='active' ? 'Route Confirmed' : 'Cant Find Route'} placement="right">
                <LockIcon style={{color:status==='active'?'#49ca97':'#febd59',fontSize:12,marginLeft:8,marginBottom:2}} />
              </Tooltip>}
            </NameWrap>
            {(pricePerMessage?true:false) && <Price>{`Price per Message: ${pricePerMessage}`}</Price>}
          </ChatInfo>
        </Left>
      </Inner>}
      {showURL && <Left>
        <Input value={URL} onChange={e => setURL(e.target.value)}
          placeholder="Application URL"
          style={{ background: theme.extraDeep }}
          onKeyPress={e => {
            if (e.key === 'Enter') goToURL()
          }}
        />
        <IconButton style={{ position: 'absolute', top: 5, right: 15, zIndex: 101, background: theme.bg, width: 32, height: 32 }}
          disabled={!URL} onClick={goToURL}>
          <NavigateNextIcon style={{ color: 'white', fontSize: 17 }} />
        </IconButton>
      </Left>}
      <Right>

        {/*apps*/}
        {appURL && <> {appMode ? <ChatIcon style={{ color: 'white', fontSize: 27, marginRight: 15, cursor: 'pointer' }}
          onClick={() => setAppMode(false)}
        /> : <OpenInBrowserIcon style={{ color: 'white', fontSize: 27, marginRight: 15, cursor: 'pointer' }}
          onClick={() => setAppMode(true)}
          />} </>}

        {/*browser/bots*/}
        {!appURL && <> {showURL ?
          <HighlightOffIcon style={{ color: 'white', fontSize: 27, marginRight: 15, cursor: 'pointer' }}
            onClick={() => { setShowURL(false); clearURL() }}
          /> :
          <IconzWrap>
            <PublicIcon style={{ color: 'white', fontSize: 27, marginRight: 15, cursor: 'pointer' }}
              onClick={() => { setShowURL(true); ui.setSelectedChat(null) }}
            />
            {!chat && <Btn onClick={() => ui.toggleBots(ui.showBots ? false : true)}><BotIcon /></Btn>}
          </IconzWrap>}
        </>}

        {/*jitsi*/}
        {chat && <PhoneIcon style={{ color: 'white', fontSize: 27, marginRight: 15, cursor: 'pointer' }}
          onClick={openJitsi}
        />}

      </Right>
    </Wrap>
  })
}

function BotIcon() {
  return <SvgIcon viewBox="64 64 896 896" height="21">
    <path d="M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
  </SvgIcon>
}

const Wrap = styled.div`
  width:100%;
  max-height:114px;
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
  position:relative; 
  z-index:100;
`
const Placeholder = styled.div`
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#ccc;
  margin-left:16px;
`
const Inner = styled.div`
  width:100%;
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#eee;
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-left:5px;
`
const AvatarWrap = styled.div`
  height:100%;
  width:80px;
`
const ChatInfo = styled.div`
  display:flex;
  flex-direction:column;
  color:white;
`
const Name = styled.div`
  font-weight:bold;
`
const NameWrap = styled.div`
  display:flex;
  align-items:center;
`
const Price = styled.div`
  font-size:12px;
  margin-top:4px;
`
const IconzWrap = styled.div`
  display:flex;
  align-items:center;
`
const Left = styled.div`
  display:flex;
  align-items:center;
  width:100%;
  position:relative;
`
const Right = styled.div`
  display:flex;
  align-items:center;
`
const Input = styled.input`
  max-width:100%;
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
  margin-right:8px;
  position:relative;
  z-index:100;
`
const Btn = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  cursor: pointer;
  margin-right:14px;
`