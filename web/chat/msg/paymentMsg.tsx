import React from 'react'
import {constants} from '../../../src/constants'
import styled from 'styled-components'
import CallMadeIcon from '@material-ui/icons/CallMade';
import CallReceivedIcon from '@material-ui/icons/CallReceived';

export default function PaymentMsg(props){
  const {amount, status, message_content} = props
  const isMe = props.sender===props.myid

  let Icon, label, color
  if (isMe) {
    Icon = CallMadeIcon
    // label = status === constants.statuses.failed ? 'FAILED' : 'SENT'
    color = status === constants.statuses.failed ? '#DB5554' : '#555'
  } else {
    Icon = CallReceivedIcon
    // label = 'RECEIVED'
    color = '#74ABFF'
  }

  return <Wrap>
    <Row>
      <IconWrap style={{background:color}}>
        <Icon style={{fontSize:15,color:'white'}} />
      </IconWrap>
      <Row>
        <Amount>{amount}</Amount>
        <Sat>sat</Sat>
      </Row>
    </Row>
    {message_content && <Text>
      {message_content}
    </Text>}
  </Wrap>
}

const Wrap = styled.div`
  padding:16px;
  max-width:220px;
  word-break: break-word;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  align-items:center;
`
const Row = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:flex-start;
  align-items:center;
`
const IconWrap = styled.div`
  background-color:#74ABFF;
  border-radius:3px;
  margin-right:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:3px;
`
const Amount = styled.div`
  color:#eee;
  font-size:18px;
  margin-right:8px;
`
const Sat = styled.div`
  color:#aaa;
  font-size:14px;
`
const Text = styled.div`
  margin-top:12px;
  width:100%;
`