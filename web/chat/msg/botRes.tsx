import React, { useEffect } from 'react'
import styled from 'styled-components'
import * as dompurify from 'dompurify'
const sanitizer = dompurify.sanitize;

export default function BotResMsg(props){
  const {message_content} = props
  return <Wrap>
    <div dangerouslySetInnerHTML={{
      __html: sanitizer(message_content)
    }} />
  </Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
`