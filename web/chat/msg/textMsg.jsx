import React from 'react'
import styled from 'styled-components'

export default function TextMsg(props){
  const {message_content} = props
  return <Wrap>{message_content}</Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
`