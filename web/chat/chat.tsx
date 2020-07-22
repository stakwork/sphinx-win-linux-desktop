import React from 'react'
import styled from 'styled-components'
import Head from './head'
import Foot from './foot'
import theme from '../theme'
import Msg from './msg'
import {constants} from '../../src/constants'
import {useStores,hooks} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
const {useMsgs} = hooks

const headHeight = 65
const footHeight = 65
function Chat(){
  const {contacts,ui} = useStores()
  return useObserver(()=>{
    const chat = ui.selectedChat
    const msgs = useMsgs(chat) || []
    const isTribe = chat&&chat.type===constants.chat_types.tribe
    const h = `calc(100% - ${headHeight+footHeight}px)`
    return <Section style={{background:theme.deep}}>
      <Head height={headHeight} />
      <MsgListWrap style={{maxHeight:h,minHeight:h}}>
        <MsgList className="msg-list">
          {msgs.map((m,i)=>{
            let senderAlias = ''
            const sender = contacts.contacts.find(c=>c.id===m.sender)
            const senderPhoto = !isTribe && (sender&&sender.photo_url) || ''
            if(isTribe) {
              senderAlias = m.sender_alias
            } else {
              senderAlias = sender && sender.alias
            }
            if (m.dateLine) {
              return <DateLine key={'date'+i} dateString={m.dateLine} />
            }
            return <Msg key={m.id} {...m} senderAlias={senderAlias} senderPhoto={senderPhoto} />
          })}
        </MsgList>
      </MsgListWrap>
      <Foot height={footHeight} />
    </Section>
  })
}

function DateLine({dateString}){
  return <DateWrap>
    <BackLine />
    <DateString style={{background:theme.deep}}>
      {dateString}
    </DateString>
  </DateWrap>
}

const Section=styled.section`
  height:100%;
  flex:1;
`
const MsgList = styled.div`
  overflow:auto;
  flex:1;
  display: flex;
  flex-direction: column-reverse;
  max-height:100%;
`
const MsgListWrap = styled.div`
  flex:1;
  display: flex;
  padding-right:3px;
`
const DateWrap = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  margin:8px;
  position:relative;
  position: relative;
  padding: 0 7px;
`
const DateString = styled.div`
  height:14px;
  font-size:14px;
  color:grey;
  position: relative;
  padding: 0 8px;
`
const BackLine = styled.div`
  background:grey;
  height:1px;
  width:96%;
  position:absolute;
  top:8px;
  left:2%;
`

export default Chat