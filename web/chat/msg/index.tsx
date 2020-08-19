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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertButton from '@material-ui/icons/MoreVert';
import ReplyIcon from '@material-ui/icons/Reply';
import LinkIcon from '@material-ui/icons/Link';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

export default function Msg(props) {
  const isMe = props.sender === 1
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isLink = props.message_content && (props.message_content.toLowerCase().startsWith('http://') || props.message_content.toLowerCase().startsWith('https://'))

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isGroupNotification = props.type === constants.message_types.group_join || props.type === constants.message_types.group_leave
  if (isGroupNotification) {
    return <GroupNotification {...props} senderAlias={props.senderAlias} />
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
          <Message {...props} />
        </Bubble>
        <MoreVertButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}
          style={{ color: '#7f7f7f', cursor: 'pointer', fontSize: 17, marginLeft: -3, marginRight: -3 }} />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isMe ? 'left' : 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: isMe ? 'right' : 'left',
          }}
          PaperProps={{
            style: {
              backgroundColor: isMe ? theme.highlight : theme.extraDeep
            },
          }}>
          <MenuItem onClick={() => {navigator.clipboard.writeText(props.message_content), handleClose(), props.onCopy('Text')}} style={{ fontSize: 14, color: 'white', backgroundColor: isMe ? theme.highlight : theme.extraDeep }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'white', marginRight: 8 }}>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>Copy Text
            </MenuItem>
          {isLink ? 
          <MenuItem onClick={() => {navigator.clipboard.writeText(props.message_content), handleClose(), props.onCopy('Link')}} style={{ fontSize: 14, color: 'white', backgroundColor: isMe ? theme.highlight : theme.extraDeep }}>
            <LinkIcon style={{ fontSize: 'medium', marginRight: 8 }} />Copy Link
            </MenuItem> : <div></div>}
          {/* <MenuItem onClick={handleClose} style={{ fontSize: 14, color: 'white', backgroundColor: isMe ? theme.highlight : theme.extraDeep }}>
            <ReplyIcon style={{ fontSize: 'medium', marginRight: 8 }} />Reply
            </MenuItem>
          {isMe ?
            <MenuItem onClick={handleClose} style={{ fontSize: 14, color: 'red', backgroundColor: isMe ? theme.highlight : theme.extraDeep }}>
              <DeleteForeverIcon style={{ color: 'red', fontSize: 'medium', marginRight: 8 }} />Delete Message
            </MenuItem> : <div></div>} */}
        </Menu>
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
