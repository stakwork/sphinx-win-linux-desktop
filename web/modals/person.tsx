import React, {useState} from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import FaceIcon from '@material-ui/icons/Face';
import theme from '../theme'
import {useStores} from '../../src/store'
import {PersonParams} from '../../src/store/ui'
import Button from '../utils/button'

export default function PersonModal({ params }:{ params:PersonParams }) {
  const {ui, contacts, chats, msg} = useStores()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const {owner_alias, img, description, owner_pubkey, owner_route_hint, owner_contact_key, price_to_meet} = params

  function onClose(){
    ui.setPersonParams(null)
  }
  async function addContactAndSendInitialMessage() {
    setLoading(true)
    const created = await contacts.addContact({
      public_key: owner_pubkey,
      route_hint: owner_route_hint,
      alias: owner_alias,
      contact_key: owner_contact_key,
    })
    const createdMessage = await msg.sendMessage({
      contact_id: created.id,
      chat_id: null,
      text: message,
      amount: price_to_meet,
      reply_uuid: ''
    })
    const theChatID = createdMessage && createdMessage.chat_id
    // refresh chats
    const cs = await chats.getChats()
    setLoading(false)
    onClose()
    if(theChatID) {
      const theChat = cs.find(c=> c.id===theChatID)
      if(theChat) ui.setSelectedChat(theChat)
    }
  }

  const already = contacts.findExistingContactByPubkey(owner_pubkey)
  if (already) {
    return <Modal
      disableAutoFocus={true}
      open={true}
      onClose={onClose}
      className="view-img-modal-wrap"
    >
      <Content style={{background:theme.bg}}>
        <H3 style={{maxWidth:200, textAlign:'center'}}>You are already connected with this person</H3>
        <ButtonsWrap>
          <Button onClick={onClose}>OK</Button>
        </ButtonsWrap>
      </Content>
    </Modal>
  }
  return <Modal
    disableAutoFocus={true}
    open={true}
    onClose={onClose}
    className="view-img-modal-wrap"
  >
    <Content style={{background:theme.bg}}>
      <PersonImg img={img} />
      {owner_alias && <H2>{owner_alias}</H2>}
      {description && <H3>
        {description}  
      </H3>}
      <TextareaWrap>
        <Input value={message} placeholder={`Initial Message to ${owner_alias}`}
          onChange={e=> setMessage(e.target.value)}
        />
      </TextareaWrap>
      <ButtonsWrap>
        <Button onClick={onClose} style={{marginRight:10}}>CANCEL</Button>
        <Button color="primary" loading={loading}
          disabled={message?false:true}
          onClick={()=> addContactAndSendInitialMessage()}>
          CONNECT
        </Button>
      </ButtonsWrap>
    </Content>
  </Modal>
}

function PersonImg({img}) {
  return <ImgWrap>
    {img ? 
      <Img src={img} /> : 
      <FaceIcon style={{fontSize:96,color:'#6681fe',marginBottom:20}} />
    }
  </ImgWrap>
}
const ImgWrap = styled.div`
  height:150px;
  width:150px;
  min-height:150px;
  border-radius:100%;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:10px;
`
const Img = styled.div`
  background: url(${p => p.src});
  background-attachment: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  width: 100%;
  background-color: black;
`
const Content = styled.div`
  /* height:480px; */
  width:330px;
  box-shadow: 0px 0px 17px 0px rgba(0,0,0,0.75);
  border:1px solid #444;
  border-radius:6px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:32px 0;
`
const H2 = styled.h2`
  color:white;
  font-size:19px;
  margin:10px 0;
`
const H3 = styled.div`
  color:#ababab;
  font-weight:normal;
  margin:10px 0;
`
const Input = styled.input`
  max-width:100%;
  width:100%;
  height:42px;
  border:none;
  outline:none;
  border-radius:32px;
  font-size:14px;
  padding-left:24px;
  padding-right:24px;
  color:grey;
  position:relative;
  z-index:100;
`
const TextareaWrap = styled.div`
  display:flex;
  justify-content:space-around;
  align-items:center;
  width:220px;
  margin-top:22px;
`
const ButtonsWrap = styled.div`
  display:flex;
  justify-content:space-around;
  align-items:center;
  width:220px;
  margin-top:35px;
`

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}