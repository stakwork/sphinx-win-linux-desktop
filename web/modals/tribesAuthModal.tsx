import React, {useState} from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import theme from '../theme'
import {useStores} from '../../src/store'
import Button from '../utils/button'

export default function TribesAuthModal({ params }) {
  const {ui, auth, user} = useStores()
  const [loading, setLoading] = useState(false)
  function onClose(){
    ui.setTribesAuthParams(null)
  }
  async function authorize(j){
    setLoading(true)
    try {
      const data = await auth.verifyExternal();
      if(data.info && data.token) {
        const body = data.info
        body.url = user.currentIP
        const protocol = j.host.includes("localhost") ? "http" : "https";
        await fetch(`${protocol}://${j.host}/verify/${j.challenge}?token=${data.token}`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch(e) {}
    setLoading(false)
    onClose()
  }
  return <Modal
    disableAutoFocus={true}
    open={true}
    onClose={onClose}
    className="view-img-modal-wrap"
  >
    <Content style={{background:theme.bg}}>
      <VerifiedUserIcon style={{fontSize:46,color:'#6681fe',marginBottom:20}} />
      <H3>Do you want to authorize with</H3>
      {params.host && <H2>{params.host}?</H2>}
      <ButtonsWrap>
        <Button onClick={onClose}>No</Button>
        <Button color="primary" loading={loading}
          onClick={()=> authorize(params)}>
          Yes
        </Button>
      </ButtonsWrap>
    </Content>
  </Modal>
}

const Content = styled.div`
  height:400px;
  width:330px;
  box-shadow: 0px 0px 17px 0px rgba(0,0,0,0.75);
  border:1px solid #444;
  border-radius:6px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
`
const H2 = styled.h2`
  color:white;
  font-size:17px;
  margin:20px 0;
`
const H3 = styled.div`
  color:#ababab;
  font-weight:normal;
  margin:20px 0;
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
const ButtonsWrap = styled.div`
  display:flex;
  justify-content:space-around;
  align-items:center;
  width:220px;
  margin-top:35px;
`