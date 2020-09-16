import React, { useState } from 'react'
import styled from 'styled-components'
import { constantCodes } from '../../../src/constants'
import TextMsg from './textMsg'
import theme from '../../theme'
import Avatar from '../../utils/avatar'
import InfoBar from './infoBar'
import { constants } from '../../../src/constants'
import GroupNotification from './groupNotification'
import MediaMsg from './mediaMsg'
import PaymentMessage from './paymentMsg'
import InvoiceMsg from './invoiceMsg'
import MoreVertButton from '@material-ui/icons/MoreVert';
import BotResMsg from './botRes'
import moment from 'moment'
import {useAvatarColor} from '../../../src/store/hooks/msg'

const timeFormat = 'hh:mm A' //ui.is24HourFormat?'HH:mm A':'hh:mm A'

export default function Msg(props) {
  const isMe = props.sender === 1

  const isGroupNotification = props.type === constants.message_types.group_join || props.type === constants.message_types.group_leave
  if (isGroupNotification) {
    return <GroupNotification {...props} senderAlias={props.senderAlias} />
  }

  const isDeleted = props.status === constants.statuses.deleted
  if (isDeleted) {
    return <DeletedMessage {...props} />
  }

  return <MsgRow>
    <Avatar alias={props.senderAlias}
      photo={props.senderPhoto}
      hide={!props.showInfoBar || isMe}
    />
    <InnerBox>
      {props.showInfoBar && <InfoBar {...props} senderAlias={props.senderAlias} />}
      <BubbleWrap style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
        <Bubble style={{ background: isMe ? theme.highlight : theme.extraDeep }}>
          {(props.reply_message_content ? true : false) &&
            <ReplyContent
              reply_message_content={props.reply_message_content}
              reply_message_sender_alias={props.reply_message_sender_alias}
              reply_message_sender={props.reply_message_sender} 
              sender = {props.sender}
            />}
          <Message {...props} />
        </Bubble>
        <MoreVertButton aria-controls="simple-menu" aria-haspopup="true" onClick={e => props.handleClick(e)}
          style={{ color: '#7f7f7f', cursor: 'pointer', fontSize: 17, marginLeft: -3, marginRight: -3 }} />
      </BubbleWrap>
    </InnerBox>
  </MsgRow>
}

function Message(props) {
  const typ = constantCodes['message_types'][props.type]
  switch (typ) {
    case 'message':
      return <TextMsg {...props} />
    case 'attachment':
      return <MediaMsg {...props} />
    case 'invoice':
      return <InvoiceMsg {...props} />
    case 'payment':
      return <PaymentMessage {...props} />
    case 'direct_payment':
      return <PaymentMessage {...props} />
    case 'bot_res':
      return <BotResMsg {...props} />
    default:
      return <></>
  }
}

function DeletedMessage(props) {
  const isMe = props.sender === 1
  return <DeletedMsgRow style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
    <DeletedInnerBox style={{ justifyContent: isMe ? 'end' : 'start' }}>
      <Time style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}>{moment(props.date).format(timeFormat)}</Time>
      <span style={{ color: '#7f7f7f', fontSize: 11, fontStyle: "italic" }}>This message has been deleted</span>
    </DeletedInnerBox>
  </DeletedMsgRow>
}

function ReplyContent({ reply_message_content, reply_message_sender_alias, sender, reply_message_sender }) {
  const replyMe = reply_message_sender === 1
  const isMe = sender === 1
  const color = useAvatarColor(reply_message_sender_alias)
  return <ReplyWrapper color={color}>
    <div>{replyMe ? 'You' : reply_message_sender_alias}</div>
    <ReplyText style={{color: isMe ? "#829cba" : "#535f6e"}}>{reply_message_content}</ReplyText>
  </ReplyWrapper>
}

const ReplyText = styled.div`
    margin-top: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

const ReplyWrapper = styled.div`
  margin: 5px 5px 5px 10px;
  padding-left: 10px;
  border-left: 5px solid ${p => p.color};
  font-size: 14px;
  width: 100%;
  max-width: 425px;
`

const Time = styled.div`
  display: flex;
  font-size:10px;
  color:grey;
  margin-bottom: 5px;
`
const DeletedInnerBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  margin-left: 10px;
`

const DeletedMsgRow = styled.div`
  display:flex;
  margin-top: 10px;
  margin-bottom: 10px;
`

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
