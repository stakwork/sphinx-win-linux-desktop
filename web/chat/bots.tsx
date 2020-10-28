import React, {useState,useEffect} from 'react'
import styled from 'styled-components'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import theme from '../theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '../utils/button'
import TextField from '@material-ui/core/TextField';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export default function Bots(){
  const {user,bots} = useStores()
  const [loading,setLoading] = useState(true)
  const [showCreate,setShowCreate] = useState(false)
  const [creating,setCreating] = useState(false)

  useEffect(()=>{
    (async () => {
      await bots.getBots()
      setLoading(false)
    })()
  },[])

  async function createBot(n,w){
    setCreating(true)
    await bots.createBot(n,w)
    setCreating(false)
    setShowCreate(false)
  }

  const noBots = bots.bots.length===0?true:false
  return useObserver(()=>  {
    return <Wrap>
      <H2>SPHINX BOTS</H2>
      <p>[for developers]</p>
      {!showCreate && <>
        {loading && <CircularProgress style={{color:'white'}} />}
        {!loading && noBots && <Zero>No Bots</Zero>}
        {/*!loading && <Webhook style={{background:theme.bg}}>
          <b>Webhook URL:</b>
          <WebhookInput readOnly type="text" value={user.currentIP+'/action'} />
        </Webhook>*/}
        {!noBots && bots.bots.map((b,i)=>{
          return <Bot key={i} bot={b} ip={user.currentIP} />
        })}
        <CreateNew>
          <Button onClick={()=>setShowCreate(true)} color="primary">New Bot</Button>
        </CreateNew>
      </>}
      {showCreate && <ShowCreate style={{background:theme.bg}}>
        <NewContent creating={creating} 
          createBot={createBot}
        />
      </ShowCreate>}
    </Wrap>
  })
}

function Bot({bot,ip}){
  const [show,setShow] = useState(false)
  const [tab,setTab] = useState(0)
  const handleChange = (_, newValue) => {
    setTab(newValue);
  };
  function makeToken(id,secret,url) {
    return btoa(id)+'.'+btoa(secret)+'.'+btoa(url)
  }
  return <BotWrap style={{background:theme.bg}}>
    <BotTop>
      <BotIcon style={{height:14,width:14}} />
      <BotItem><b>{bot.name}</b></BotItem>
    </BotTop>
    
    <Tabs value={tab} onChange={handleChange} aria-label="simple tabs example">
      <Tab label="sphinx-bot.js" />
      <Tab label="HTTP Connection" />
    </Tabs>

    {tab===0 && <Pad>
      <Token>{makeToken(bot.id,bot.secret,ip+'/action')}</Token>
    </Pad>}

    {tab===1 && <Pad>
      <BotItem><span>ID:</span><b>{bot.id}</b></BotItem>
      <BotItem>
        <span>Secret:</span>
        <Secret readOnly type={show?'text':'password'} value={bot.secret} 
          style={{textOverflow:show?'ellipsis':'initial'}}
        />
        {show ? <VisibilityOffIcon onClick={()=>setShow(!show)} style={{fontSize:18,color:'white',cursor:'pointer'}} /> :
          <VisibilityIcon onClick={()=>setShow(!show)} style={{fontSize:18,color:'white',cursor:'pointer'}} />
        }
      </BotItem>
    </Pad>}

  </BotWrap>
}
function BotIcon({style}){
  return <SvgIcon style={style} viewBox="64 64 896 896" fill="#ddd">
    <path d="M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
  </SvgIcon>
}


function NewContent({createBot,creating}){
  const [name,setName] = useState('')
  const [webhook,setWebhook] = useState('')
  return <>
    <TextField style={{ marginBottom:5 }}
      label="Bot Name" type="text" value={name}
      inputProps={{ style: { textAlign: 'center' } }}
      onChange={(e)=>setName(e.target.value)}
    />
    <TextField
      label="Bot Webhook" type="text" value={webhook}
      inputProps={{ style: { textAlign: 'center' } }}
      onChange={(e)=>setWebhook(e.target.value)}
    />
    <Button onClick={()=>createBot(name,webhook)} color="primary" style={{marginTop:35}}
      disabled={!name} loading={creating}>
      Create
    </Button>
  </>
}

const Wrap = styled.div`
  width:100%;
  height:100%;
  max-height:114px;
  display:flex;
  flex-direction:column;
  align-items:center;
  min-height: calc(100% - 65px);
  max-height: calc(100% - 65px);
  overflow:auto;
`
const H2 = styled.h2`
  color:white;
  margin-bottom:0;
`
const Zero = styled.div`
  color:white;
  margin-top:40px;
`
const BotWrap = styled.div`
  width:420px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
  position:relative;
  margin-top:10px;
`
const Pad = styled.div`
  padding:24px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  max-width:100%;
`
const BotItem = styled.div`
  color:white;
  margin:8px;
  display:flex;
  align-items:center;
  justify-content:center;
  & span {
    margin-right:8px;
  }
`
const Secret=styled.input`
  border:none;
  outline:none;
  color:white;
  width:205px;
  margin-right:9px;
  background:transparent;
  overflow:hidden;
`
const CreateNew = styled.div`
  margin:40px;
`
const ShowCreate = styled.div`
  width:400px;
  padding:40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
  & label {
    color: white;
  }
  & .MuiInput-underline:before {
      border-bottom: 1px solid white;
  }
  & .MuiInput-underline:hover:not(.Mui-Disabled):before{
      border-bottom: 1px solid white;
  }
  & .MuiInputBase-root{
      color: white;
  }
`
const Row = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
`
const Webhook = styled.div`
  width:400px;
  padding:23px;
  margin:23px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
  & b {
    font-size:11px;
    margin-bottom:8px;
  }
`
const WebhookInput = styled.input`
  border:none;
  outline:none;
  color:white;
  background:transparent;
  overflow:hidden;
  text-overflow:ellipsis;
  width:100%;
  color:#ddd;
`
const Token = styled.pre`
  color:white;
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  white-space: pre-wrap;
  margin:5px 0;
`
const BotTop = styled.div`
align-self: flex-start;
    margin-left: 18px;
    margin-top: 6px;
    display:flex;
  align-items:center;
  justify-content:center;
`