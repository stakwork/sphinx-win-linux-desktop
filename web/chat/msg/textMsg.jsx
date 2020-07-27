import React from 'react'
import styled from 'styled-components'
import {openLink} from '../../utils/openLink'
import { ReactTinyLink } from 'react-tiny-link-electron'

export default function TextMsg(props){
  const {message_content} = props
  const isLink = message_content && (message_content.toLowerCase().startsWith('http://') || message_content.toLowerCase().startsWith('https://'))
  if (isLink) {
    return <LinkWrap>
      <Link href={message_content} target="_blank" onClick={e=>{
        e.preventDefault()
        openLink(event.target.href)
      }}>
        {message_content}
      </Link>
      <ReactTinyLink
        cardSize="small"
        showGraphic={true}
        maxLine={2}
        minLine={1}
        url={message_content}
      />
    </LinkWrap>
  }
  return <Wrap>{message_content}</Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
`
const Link = styled.a`
  display:block;
  padding:16px;
  max-width:440px;
  word-break: break-word;
  color:#6089ff;
  &:focus{
    color:#6089ff;
  }
  &:visited{
    color:#6089ff;
  }
`
const LinkWrap = styled.div`
  
`