import React from 'react'
import styled from 'styled-components'
import {constants} from '../../../src/constants'
import theme from '../../theme'

export default function GroupNotification(props){
  const isMe = props.contact===props.myid
  let senderAlias = props.senderAlias
  const isJoin = props.type===constants.message_types.group_join
  return <Wrap style={{flexDirection: isMe?'row-reverse':'row'}}>
    <Content style={{background:theme.extraDeep}}>
      <Text>
        {`${senderAlias} has ${isJoin?'joined':'left'} the group`}
      </Text>
    </Content>
  </Wrap>
}

const Wrap = styled.div`
  display:flex;
  height:30px;
  width:100%;
  justify-content:center;
  margin-bottom:10px;
`
const Content=styled.div`
  display:flex;
  justify-content:center;
  border-width:1px;
  padding:3px 15px;
  border-radius:12px;
  border-color:#DADFE2;
  background-color:#F9FAFC;
  margin:5px 0;
`
const Text = styled.div`
  font-size:12px;
  color:#ddd;
`