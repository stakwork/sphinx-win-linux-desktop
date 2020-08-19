import React, { useState } from 'react'
import styled from 'styled-components'
import Head from './head'
import Foot from './foot'
import theme from '../theme'
import Msg from './msg'
import {constants} from '../../src/constants'
import {useStores,hooks} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import Frame from './frame'
import { CircularProgress } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';
const {useMsgs} = hooks

const headHeight = 65
const footHeight = 65
function Chat(){
  return <Section style={{background:theme.deep}}>
    <Head height={headHeight} />
    <ChatContent />
    <Foot height={footHeight} />
  </Section>
}

function ChatContent(){
  const {contacts,ui} = useStores()
  const [alert, setAlert] = useState(``)
  function onCopy(word){
    setAlert(`${word} copied to clipboard`)
    setTimeout(() => {
      setAlert(``)
    }, 2000);
  }
  return useObserver(()=> {
    const chat = ui.selectedChat
    const appURL = ui.applicationURL
    const msgs = useMsgs(chat) || []
    const isTribe = chat&&chat.type===constants.chat_types.tribe
    const h = `calc(100% - ${headHeight+footHeight}px)`
    if(ui.loadingChat) {
      return <LoadingWrap style={{maxHeight:h,minHeight:h}}>
        <CircularProgress size={32} style={{color:'white'}} />
      </LoadingWrap>
    }
    return (<>
      {!appURL && <MsgListWrap style={{maxHeight:h,minHeight:h}}>
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
            return <Msg key={m.id} {...m} senderAlias={senderAlias} senderPhoto={senderPhoto} onCopy={onCopy}/>
          })}
        </MsgList>
        {alert && <Alert style={{position: 'absolute', bottom: 20, left: 'calc(50% - 90px)', opacity: 0.7, height: 35, padding: `0px 8px 4px 8px` }} icon={false}>{alert}</Alert>}
      </MsgListWrap>}
      {appURL && <Frame url={appURL} />}
    </>)
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
  position: relative;
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
const LoadingWrap = styled.div`
  flex:1;
  display: flex;
  align-items:center;
  justify-content:center;
`

export default Chat