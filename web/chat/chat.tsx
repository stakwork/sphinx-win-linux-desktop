import React, { useState, useEffect } from 'react'
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
  const [appMode,setAppMode] = useState(true)
  return <Section style={{background:theme.deep}}>
    <Head height={headHeight} setAppMode={setAppMode} appMode={appMode} />
    <ChatContent appMode={appMode} setAppMode={setAppMode} />
    <Foot height={footHeight} />
  </Section>
}

function ChatContent({appMode,setAppMode}){
  const {contacts,ui,chats} = useStores()
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

    useEffect(()=>{
      if(!chat) return
      (async () => {
        setAppMode(true)
        let isAppURL = false
        if(chat.type===constants.chat_types.tribe) {
          ui.setLoadingChat(true)
          const params = await chats.getTribeDetails(chat.host,chat.uuid)
          if(params && params.app_url) {
            isAppURL = true
            ui.setApplicationURL(params.app_url)
          }
          ui.setLoadingChat(false)
        }
        if(!isAppURL) {
          ui.setApplicationURL('')
        }
      })()
    },[chat])
  
    const msgs = useMsgs(chat) || []
    const isTribe = chat&&chat.type===constants.chat_types.tribe
    const h = `calc(100% - ${headHeight+footHeight}px)`
    if(ui.loadingChat) {
      return <LoadingWrap style={{maxHeight:h,minHeight:h}}>
        <CircularProgress size={32} style={{color:'white'}} />
      </LoadingWrap>
    }
    return (<Wrap h={h}>
      <Layer show={!appMode} style={{background:theme.deep}}>
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
      </Layer>
      {appURL && <Layer show={appMode} style={{background:theme.deep, height:'calc(100% + 63px)'}}>
        <Frame url={appURL} />
      </Layer>}
    </Wrap>)
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

const Wrap = styled.div`
  flex:1;
  display: flex;
  padding-right:3px;
  position: relative;
  min-height: ${p=> p.h};
  max-height: ${p=> p.h};
  width:100%;
`
const Section=styled.section`
  height:100%;
  flex:1;
  position:relative;
  z-index:99;
`
const MsgList = styled.div`
  overflow:auto;
  flex:1;
  display: flex;
  flex-direction: column-reverse;
  max-height:100%;
`
const Layer = styled.div`
  flex:1;
  display: flex;
  padding-right:3px;
  position: absolute;
  width:100%;
  height:100%;
  z-index: ${p=> p.show ? 101 : 99};
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