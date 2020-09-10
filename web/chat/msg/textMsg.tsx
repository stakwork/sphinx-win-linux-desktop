import React, { useEffect } from 'react'
import styled from 'styled-components'
import { openLink } from '../../utils/openLink'
import { ReactTinyLink } from 'react-tiny-link-electron'
import { useParsedGiphyMsg } from '../../../src/store/hooks/msg'
import { message } from '../../../src/store/websocketHandlers'
import Linkify from 'react-linkify';
import * as ipc from '../../crypto/ipc'
import { useHasLink } from './hooks'

export default function TextMsg(props) {
  const { message_content } = props
  const link = useHasLink(props)
  const hasLink = message_content && link
  if (hasLink) {
    return <Wrap>
      <LinkifyWrapper>
        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
          <a target="blank" href={decoratedHref} key={key} onClick={e => {
            e.preventDefault();
            ipc.send(`link`, {link})
        }} >
            {decoratedText}
        </a>
    )}>{message_content}</Linkify>
      </LinkifyWrapper >
      <ReactTinyLink
        cardSize="small"
        showGraphic={true}
        maxLine={2}
        minLine={1}
        url={link}
      />
    </Wrap >
  }

  

  const isGiphy = message_content && message_content.startsWith('giphy::')
  if (isGiphy) {
    const { url, aspectRatio } = useParsedGiphyMsg(message_content)
    return <GIF src={url} aspectRatio={aspectRatio} />
  }

  const emo_regex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/;
  if (emo_regex.test(message_content)) {
    return <Wrap style={{ fontSize: 40 }}>{message_content}</Wrap>
  }

  return <Wrap>{message_content}</Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
`
const LinkifyWrapper = styled.div`
  margin-bottom: 10px;
  & a {
    color: #618aff;
  }
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
  background-image: url(${p => p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  height:220px;
  width:${p => 220 * (p.aspectRatio || 1)}px;
`