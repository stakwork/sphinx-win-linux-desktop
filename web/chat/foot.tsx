import React, {useState} from 'react'
import styled from 'styled-components'
import theme from '../theme'
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'

export default function Foot({height}){
  const {ui,msg} = useStores()
  const [text,setText] = useState('')

  const chat = ui.selectedChat

  function sendMessage(){
    if(!text) return
    let contact_id=chat.contact_ids.find(cid=>cid!==1)
    msg.sendMessage({
      contact_id,
      text,
      chat_id: chat.id||null,
      amount:0,
      reply_uuid:''
    })
    setText('')
  }

  return useObserver(()=>{
    
    return <Wrap style={{background:theme.bg,height}}>
      <Input value={text} onChange={e=> setText(e.target.value)} 
        placeholder="Message" style={{background:theme.extraDeep}}
        disabled={!chat}
        onKeyPress={e=>{
          if(e.key==='Enter') sendMessage()
        }}
      />
      <IconButton style={{background:chat?theme.primary:theme.extraDeep,width:39,height:39,marginRight:10}}
        disabled={!chat||!text} onClick={sendMessage}>
        <SendIcon style={{color:'white',fontSize:17}} />
      </IconButton>
    </Wrap>
  })
}

const Wrap=styled.div`
  width:100%;
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:space-between;
  box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.45);
`
const Input = styled.input`
  max-width:calc(100% - 64px);
  width:100%;
  height:42px;
  border:none;
  outline:none;
  border-radius:32px;
  font-size:14px;
  padding-left:24px;
  padding-right:24px;
  color:white;
  margin-left:8px;
`

