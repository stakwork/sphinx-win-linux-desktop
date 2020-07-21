import React from 'react'
import styled from 'styled-components'
import {constantCodes} from '../../../src/constants'
import TextMsg from './textMsg'
import theme from '../../theme'

export default function Msg(props){
  const isMe = props.sender===1
  return <MsgRow style={{flexDirection: isMe?'row-reverse':'row'}}>
    <Bubble style={{background:isMe?theme.highlight:theme.extraDeep}}>
      <Message {...props} />
    </Bubble>
  </MsgRow>
}

function Message(props){
  const typ = constantCodes['message_types'][props.type]
  switch (typ) {
    case 'message':
      return <TextMsg {...props} />
    // case 'attachment':
    //   return <MediaMsg {...props} />
    // case 'invoice':
    //   return <Invoice {...props} />
    // case 'payment':
    //   return <PaymentMessage {...props} />
    // case 'direct_payment':
    //   return <PaymentMessage {...props} />
    // case 'attachment':
    //   return <TextMsg {...props} />
    default:
      return <></>
  }
}

const MsgRow = styled.div`
  min-height:50px;
  flex-shrink:0;
  display:flex;
`
const Bubble = styled.div`
  margin:16px 24px;
  border-radius:6px;
  padding:14px 18px;
`