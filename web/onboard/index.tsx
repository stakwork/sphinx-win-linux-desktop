import React, {useState,useEffect} from 'react'
import styled from 'styled-components'
import { useStores } from '../../src/store'
import SendIcon from '@material-ui/icons/Send';
import * as aes from '../crypto/aes'
import PIN, {setPinCode} from '../modals/pin'
import * as rsa from '../crypto/rsa'
import {constants} from '../../src/constants'
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import actions from '../../src/store/actions'

function Onboard(props){
  const {user,contacts,chats} = useStores()
  const [text,setText] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [alias,setAlias] = useState('')
  const [showAliasInput, setShowAliasInput] = useState(false)

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
        signupWithIP(codeString)
        return
      }
    } catch(e) {}

    const r = await user.signupWithCode(text)
    if(!r) {
      setChecking(false)
      return
    }
    const {ip,password} = r
    await sleep(200)
    if (ip) {
      const token = await user.generateToken(password||'')
      if(token) setShowAliasInput(true)
    }
    setChecking(false)
  }

  // from relay QR code
  async function signupWithIP(s){
    const a = s.split('::')
    if(a.length===1) return
    setChecking(true)
    const ip = a[1]
    const pwd = a.length>2?a[2]:''
    await user.signupWithIP(ip)
    await sleep(200)
    const token = await user.generateToken(pwd)
    if(token) {
      setShowAliasInput(true)
    }
    setChecking(false)
  }

  async function aliasEntered(alias){
    if(checking || !alias) return
    setChecking(true)
    const publicKey = await rsa.genKeys()
    await contacts.updateContact(1, {
      alias, contact_key: publicKey // set my pubkey in relay
    })
    user.setAlias(alias)
    await Promise.all([
      contacts.addContact({
        alias: user.invite.inviterNickname,
        public_key: user.invite.inviterPubkey,
        status: constants.contact_statuses.confirmed,
        route_hint: user.invite.inviterRouteHint,
      }),
      actions(user.invite.action),
      user.finishInvite(),
      chats.joinDefaultTribe()
    ])
    setChecking(false)
    props.onRestore()
  }

  async function pinEntered(pin){
    try {
      const restoreString = atob(text)
      if(restoreString.startsWith('keys::')) {
        const enc = restoreString.substr(6)
        const dec = await aes.decrypt(enc,pin)
        if(dec) {
          await setPinCode(pin)
          const priv = await user.restore(dec)
          if(priv) {
            rsa.setPrivateKey(priv)
            return props.onRestore()
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
  if(showAliasInput && user.invite) {
    const inv = user.invite
    return <main className="onboard">
      <Logo src="static/sphinx-white-logo.png" />
      <Title>{inv.welcomeMessage}</Title>
      <InputWrap>
        <Input value={alias} onChange={e=> setAlias(e.target.value)} 
          placeholder="Choose a username" style={{maxWidth:300}}
        />
        <CheckCircleIcon onClick={()=> aliasEntered(alias)}
          style={{color:alias?'#6A8FFF':'#A5A5A5',fontSize:32,position:'absolute',right:14,top:16,cursor:'pointer'}} 
        />
      </InputWrap>
      <div style={{height:80}}>
        {checking && <CircularProgress style={{color:'white'}} />}
      </div>
    </main>
  }
  return <main className="onboard">
    <Logo src="static/sphinx-white-logo.png" />
    {props.welcome && <>
      <Title>Welcome</Title>
      <Msg data-testid={"onboardtext"}>Paste the invitation text or scan the QR code</Msg>
      <InputWrap>
        <Input id={"onboard-enter-code"} value={text} onChange={e=> setText(e.target.value)} 
          placeholder="Enter Code..."
        />
        <SendIcon id={"onboard-send-button"} onClick={checkCode}
          style={{color:text?'#6A8FFF':'#A5A5A5',fontSize:24,position:'absolute',right:16,top:20,cursor:'pointer'}} 
        />
      </InputWrap>
      <div style={{height:80}}>
        {checking && <CircularProgress style={{color:'white'}} />}
      </div>
    </>}
  </main>
}

const Logo = styled.div`
  background-image: url(${p=>p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  width:120px;
  height:120px;
  margin-top:64px;
`
const Title=styled.h1`
  font-weight:bold;
  color:white;
  margin-top:64px;
`
export const Msg=styled.div`
  font-size:18px;
  max-width:200px;
  text-align:center;
`
const InputWrap=styled.div`
  margin-top:64px;
  margin-bottom:64px;
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

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}