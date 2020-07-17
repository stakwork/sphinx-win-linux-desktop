import React from 'react'
import styled from 'styled-components'
import Avatar from '../utils/avatar'
import theme from '../theme'

export default function ChatRow(props){
  console.log(props)
  const {name,photo_url} = props
  return <Wrap style={{borderColor:theme.dark}}>
    <AvatarWrap>
      <Avatar big photo={photo_url} alias={name} />
    </AvatarWrap>
    <Name>{name}</Name>
  </Wrap>
}

const Wrap = styled.div`
  width:100%;
  height:80px;
  display:flex;
  align-items:center;
  border-bottom:2px solid black;
`
const AvatarWrap = styled.div`
  width:80px;
  height:80px;
  display:flex;
  align-items:center;
  justify-contents:center;
  margin-left:10px;
`
const Name = styled.div`
  font-size:16px;
`