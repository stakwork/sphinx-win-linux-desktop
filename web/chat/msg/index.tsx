import React from 'react'
import styled from 'styled-components'
import {constantCodes} from '../../../src/constants'
import TextMsg from './textMsg'
import theme from '../../theme'
import Avatar from '../../utils/avatar'
import InfoBar from './infoBar'
import {constants} from '../../../src/constants'
import GroupNotification from './groupNotification'
import MediaMsg from './mediaMsg'
import PaymentMessage from './paymentMsg'

export default function Msg(props){
  const isMe = props.sender===1

  const isGroupNotification = props.type===constants.message_types.group_join || props.type===constants.message_types.group_leave
  if(isGroupNotification) {
    return <GroupNotification {...props} senderAlias={props.senderAlias} />
  }

  return <MsgRow>
    <Avatar alias={props.senderAlias}
      photo={props.senderPhoto}
      hide={!props.showInfoBar||isMe} 
    />
    <InnerBox>
      {props.showInfoBar && <InfoBar {...props} senderAlias={props.senderAlias} />}
      <BubbleWrap style={{flexDirection: isMe?'row-reverse':'row'}}>
        <Bubble style={{background:isMe?theme.highlight:theme.extraDeep}}>
          <Message {...props} />
        </Bubble>
      </BubbleWrap>
    </InnerBox>
  </MsgRow>
}

function Message(props){
  const typ = constantCodes['message_types'][props.type]
  switch (typ) {
    case 'message':
      return <TextMsg {...props} />
    case 'attachment':
      return <MediaMsg {...props} />
    // case 'invoice':
    //   return <Invoice {...props} />
    case 'payment':
      return <PaymentMessage {...props} />
    case 'direct_payment':
      return <PaymentMessage {...props} />
    default:
      return <></>
  }
}

const MsgRow = styled.div`
  min-height:50px;
  flex-shrink:0;
  display:flex;
  padding-left:8px;
  margin:4px 0 6px 0;
`
const InnerBox = styled.div`
  display:flex;
  flex-direction:column;
  flex:1;
  margin:0px 9px;
`
const BubbleWrap = styled.div`
  min-height:50px;
  flex-shrink:0;
  display:flex;
  flex:1;
  margin-top:4px;
`
const Bubble = styled.div`
  border-radius:6px;
  overflow:hidden;
`
