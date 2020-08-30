import React, { useEffect } from 'react'
import styled from 'styled-components'
import {openLink} from '../../utils/openLink'
import { ReactTinyLink } from 'react-tiny-link-electron'
import {useParsedGiphyMsg} from '../../../src/store/hooks/msg'
import { message } from '../../../src/store/websocketHandlers'
import Linkify from 'react-linkify';

export default function TextMsg(props){
  const {message_content} = props
  var messageArray = message_content.split(` `)
  var urlRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi
  var link = null

  messageArray.forEach(function (element, index) {
    if(urlRegex.test(element)){
      if(!element.startsWith(`https://`)){element = `https://` + element}
      link = element
      // messageArray[index] = '{<a href="' + element + '">' + element + '</a>}';
    }
  });
  console.log(link)
  const hasLink = message_content && link
  
  if (hasLink) {
    return <Wrap>
      <Linkify component='button' properties={{onClick: function onClick() { alert( 'Success!'); }}}>{messageArray.join(` `)}</Linkify>
      <Link href={link} target="_blank" onClick={(e:any)=>{
        e.preventDefault()
        const target:any = event.target
        openLink(target.href)
      }}>
      </Link>
      <ReactTinyLink
        cardSize="small"
        showGraphic={true}
        maxLine={2}
        minLine={1}
        url={link}
      />
    </Wrap>
  }

  const isGiphy = message_content && message_content.startsWith('giphy::')
  if(isGiphy) {
    const {url,aspectRatio} = useParsedGiphyMsg(message_content)
    return <GIF src={url} aspectRatio={aspectRatio} />
  }

  const emo_regex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/;
  if(emo_regex.test(message_content)) {
    return <Wrap style={{fontSize: 40}}>{message_content}</Wrap>
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