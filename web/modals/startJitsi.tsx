import React from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import { useStores } from '../../src/store'
import theme from '../theme'
import Button from '@material-ui/core/Button';
import MicIcon from '@material-ui/icons/Mic'
import VideoCallIcon from '@material-ui/icons/VideoCall'

export default function StartJitsi() {
  const { ui,msg } = useStores()
  const close = () => ui.setStartJitsiParams(null)

  const chat = ui.selectedChat
  const params = ui.startJitsiParams
  function startCall(audioOnly:boolean){
    if(!chat) return
    if(!params) return
    const time = new Date().getTime()
    const txt = `https://jitsi.sphinx.chat/sphinx.call.${time}${audioOnly?'#config.startAudioOnly=true':''}`
    let contact_id = chat.contact_ids.length===2 && chat.contact_ids.find(cid => cid !== 1)
    msg.sendMessage({
      contact_id: contact_id || null,
      text:txt,
      chat_id: chat.id || null,
      amount: params.pricePerMessage || 0,
      reply_uuid: ''
    })
    close()
  }

  return <Modal
    open={true}
    onClose={close}
    className="view-img-modal-wrap"
  >
    <Content style={{background:theme.bg}}>
      <Button variant="text" size="medium" style={{width:'100%',color:'white',textAlign:'left'}}
        onClick={()=>startCall(true)}>
        <MicIcon style={{fontSize:20,color:'white',marginRight:10}} />
        AUDIO
      </Button>
      <Spacer/>
      <Button variant="text" size="medium" style={{width:'100%',color:'white',textAlign:'left'}}
        onClick={()=>startCall(false)}>
        <VideoCallIcon style={{fontSize:20,color:'white',marginRight:10}} />
        VIDEO OR AUDIO
      </Button>
      <Spacer/>
      <Button variant="text" size="medium" style={{width:'100%',color:'#ec7473'}}
        onClick={close}>
        CANCEL
      </Button>
    </Content>
  </Modal>
}

const Content = styled.div`
  width: 320px;
  height: 170px;
  border-radius:15px;
  box-shadow: 0px 2px 10px 1px rgba(0,0,0,0.95);
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:20px;
`
const Spacer = styled.div`
  width:'100%';
  margin:7px 0;
  border-bottom:1px solid #666;
`