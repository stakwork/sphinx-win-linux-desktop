import React, {useState,useEffect} from 'react'
import styled from 'styled-components'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import theme from '../theme'
import Avatar from '../utils/avatar'
import PublicIcon from '@material-ui/icons/Public';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import IconButton from '@material-ui/core/IconButton';
import {contactForConversation} from '../chatList/chatList'
import {constants} from '../../src/constants'

export default function Head({height}){
  const [showURL,setShowURL] = useState(false)
  const [URL,setURL] = useState('')
  const {contacts,ui} = useStores()

  return useObserver(()=>  {
    const chat = ui.selectedChat

    function goToURL(){
      ui.setApplicationURL(URL)
    }
    function clearURL(){
      setURL('')
      ui.setApplicationURL('')
    }

    useEffect(()=>{
      if(chat) {
        setURL('')
        setShowURL(false)
      }
    },[chat])

    let photoURL = chat&&chat.photo_url
    if(chat && chat.type===constants.chat_types.conversation){
      const cid = chat.contact_ids.find(id=>id!==1)
      const contact = contacts.contacts.find(c=> c.id===cid)
      if(contact && contact.photo_url) {
        photoURL = contact.photo_url
      }
    }

    return <Wrap style={{background:theme.bg,height}}>
      {!chat && !showURL && <Placeholder>
        Open a conversation to start using Sphinx
      </Placeholder>}
      {chat && <Inner>
        <Left>
          <AvatarWrap>
            <Avatar big photo={photoURL} alias={chat.name} />
          </AvatarWrap>
          <ChatInfo>
            <Name>{chat.name}</Name>
          </ChatInfo>
        </Left>
      </Inner>}
      {showURL && <Left>
        <Input value={URL} onChange={e=> setURL(e.target.value)} 
          placeholder="Application URL" 
          style={{background:theme.extraDeep}}
          onKeyPress={e=>{
            if(e.key==='Enter') goToURL()
          }}
        />
        <IconButton style={{position:'absolute',top:5,right:15,zIndex:101,background:theme.bg,width:32,height:32}}
          disabled={!URL} onClick={goToURL}>
          <NavigateNextIcon style={{color:'white',fontSize:17}} />
        </IconButton>
      </Left>}
      <Right>
        {showURL ? 
          <HighlightOffIcon style={{color:'white',fontSize:27,marginRight:15,cursor:'pointer'}} 
            onClick={()=> {setShowURL(false); clearURL()}}
          /> :
          <PublicIcon style={{color:'white',fontSize:27,marginRight:15,cursor:'pointer'}} 
            onClick={()=> {setShowURL(true); ui.setSelectedChat(null)}}
          />
        }
      </Right>
    </Wrap>
  })
}

const Wrap = styled.div`
  width:100%;
  max-height:114px;
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
`
const Placeholder=styled.div`
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
const Info = styled.div`
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