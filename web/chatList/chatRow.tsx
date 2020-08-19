import React from 'react'
import styled from 'styled-components'
import Avatar from '../utils/avatar'
import theme from '../theme'
import {hooks} from '../../src/store'
const {useChatRow} = hooks

export default function ChatRow(props){
  const {lastMsgText,hasLastMsg,unseenCount,hasUnseen} = useChatRow(props.id)
  const {name,photo_url,onClick,selected,contact_photo} = props
  return <Wrap onClick={onClick} style={{
    borderColor:theme.deep,
    background:selected?theme.deep:theme.bg
  }}>
    <AvatarWrap>
      <Avatar big photo={contact_photo||photo_url} alias={name} />
    </AvatarWrap>
    <Right>
      <Name>{name}</Name>
      {hasLastMsg && <LastMsg numberOfLines={1} 
        style={{
          fontWeight:hasUnseen?'bold':'normal',
          color:hasUnseen?'white':'grey',
          // maxWidth:w-105
        }}>
        {lastMsgText}
      </LastMsg>}
    </Right>
  </Wrap>
}

const Wrap = styled.div`
  cursor:pointer;
  width:100%;
  height:80px;
  display:flex;
  align-items:center;
  border-bottom:2px solid black;
  position:relative;
  z-index:10;
`
const AvatarWrap = styled.div`
  width:76px;
  min-width:76px;
  height:80px;
  display:flex;
  align-items:center;
  justify-contents:center;
  margin-left:10px;
`
const Name = styled.div`
  font-size:18px;
`
const Right = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:center;
  width:calc(100% - 88px);
  padding-right:14px;
`
const LastMsg = styled.div`
  color:grey;
  margin-top:6px;
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:14px;
`