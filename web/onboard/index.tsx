import React, {useState} from 'react'
import styled from 'styled-components'
import SendIcon from '@material-ui/icons/Send';
import * as aes from '../crypto/aes'

aes.decrypt()

function Onboard(){
  const [text,setText] = useState('')

  function checkCode(){
    if(!text) return
    console.log(text)
  }

  return <main className="onboard">
    <Logo src="static/sphinx-white-logo.png" />
    <Title>Welcome</Title>
    <Msg>Paste the invitation text or scan the QR code</Msg>
    <InputWrap>
      <Input value={text} onChange={e=> setText(e.target.value)} 
        placeholder="Enter Code..."
      />
      <SendIcon onClick={checkCode}
        style={{color:'#6A8FFF',fontSize:24,position:'absolute',right:16,top:20,cursor:'pointer'}} 
      />
    </InputWrap>
  </main>
}

const Logo = styled.div`
  background-image: url(${p=>p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  width:120px;
  height:120px;
`
const Title=styled.h1`
  font-weight:bold;
  color:white;
  margin-top:64px;
`
const Msg=styled.div`
  font-size:18px;
  max-width:200px;
  text-align:center;
`
const InputWrap=styled.div`
  margin-top:64px;
  margin-bottom:100px;
  position:relative;
`
const Input=styled.input`
  width:500px;
  height:64px;
  border:none;
  outline:none;
  border-radius:32px;
  font-size:16px;
  padding-left:32px;
  
`

export default Onboard