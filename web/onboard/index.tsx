import React, {useState} from 'react'
import styled from 'styled-components'
import { useStores } from '../../src/store'
import SendIcon from '@material-ui/icons/Send';
import * as aes from '../crypto/aes'
import PIN, {setPinCode} from '../modals/pin'

function Onboard(){
  const {user} = useStores()
  const [text,setText] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [checking, setChecking] = useState(false)

  async function checkCode(){
    if(!text || checking) return
    setChecking(true)
    try {
      const codeString = atob(text)
      if(codeString.startsWith('keys::')) {
        setShowPin(true)
        return
      }
      if(codeString.startsWith('ip::')){
        // signupWithIP(codeString)
        return
      }
    } catch(e) {}

    // const {ip,password} = await user.signupWithCode(theCode)
    // await sleep(200)
    // if (ip) {
    //   const token = await user.generateToken(password||'')
    //   if(token) onDone()
    // }
    // setChecking(false)
  }

  async function pinEntered(pin){
    try{
      const restoreString = atob(text)
      if(restoreString.startsWith('keys::')) {
        const enc = restoreString.substr(6)
        const dec = await aes.decryptSync(enc,pin)
        if(dec) {
          console.log("DEC ASDFASDF!!!!!!!!!")
          await setPinCode(pin)
          const priv = await user.restore(dec)
          if(priv) {
            // rsa.setPrivateKey(priv)
            // return onRestore()
          }
        }
      }
    } catch(e){}
     // wrong PIN
    setShowPin(false)
    setChecking(false)
  }

  if(showPin) {
    return <main className="onboard">
      <PIN forceEnterMode onFinish={pinEntered}/>
    </main>
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
  padding-right:52px;
`

export default Onboard