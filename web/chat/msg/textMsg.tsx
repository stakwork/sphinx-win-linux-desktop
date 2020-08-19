import React, { useEffect } from 'react'
import styled from 'styled-components'
import {openLink} from '../../utils/openLink'
import { ReactTinyLink } from 'react-tiny-link-electron'
import {useParsedGiphyMsg} from '../../../src/store/hooks/msg'
import { message } from '../../../src/store/websocketHandlers'

export default function TextMsg(props){
  const {message_content} = props
  const isLink = message_content && (message_content.toLowerCase().startsWith('http://') || message_content.toLowerCase().startsWith('https://'))
  
  if (isLink) {
    return <LinkWrap>
      <Link href={message_content} target="_blank" onClick={(e:any)=>{
        e.preventDefault()
        const target:any = event.target
        openLink(target.href)
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

  const isGiphy = message_content && message_content.startsWith('giphy::')
  if(isGiphy) {
    const {url,aspectRatio} = useParsedGiphyMsg(message_content)
    return <GIF src={url} aspectRatio={aspectRatio} />
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
const GIF = styled.div`
  background-image: url(${p=>p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  height:220px;
  width:${p=>220*(p.aspectRatio||1)}px;
`