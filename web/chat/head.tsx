import React from 'react'
import styled from 'styled-components'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import theme from '../theme'
import Avatar from '../utils/avatar'

export default function Head({height}){
  const {details,ui} = useStores()
  const chat = ui.selectedChat
  return useObserver(()=> <Wrap style={{background:theme.bg,height}}>
    {!chat && <Placeholder>
      Open a conversation to start using Sphinx
    </Placeholder>}
    {chat && <Inner>
      <AvatarWrap>
        <Avatar big photo={chat.photo_url} alias={chat.name} />
      </AvatarWrap>
      <ChatInfo>
        <Name>{chat.name}</Name>
      </ChatInfo>
    </Inner>}
  </Wrap>)
}

const Wrap = styled.div`
  width:100%;
  max-height:114px;
  display:flex;
  flex-direction:row;
  align-items:center;
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
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#eee;
  display:flex;
  align-items:center;
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