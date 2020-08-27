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

export default function Bots({chat}){
  const {user,bots} = useStores()
  const [loading,setLoading] = useState(true)
  const [showCreate,setShowCreate] = useState(false)
  const [creating,setCreating] = useState(false)
  const [name,setName] = useState('')

  useEffect(()=>{
    (async () => {
      await bots.getBotsForTribe(chat.id)
      setLoading(false)
    })()
  },[])

  async function createBot(){
    setCreating(true)
    await bots.createBot(chat.id,name)
    setCreating(false)
    setName('')
    setShowCreate(false)
  }

  const noBots = bots.bots.length===0?true:false
  return useObserver(()=>  {
    return <Wrap>
      <H2>SPHINX BOTS</H2>
      {!showCreate && <>
        {loading && <CircularProgress style={{color:'white'}} />}
        {!loading && noBots && <Zero>No Bots</Zero>}
        {!loading && <Webhook style={{background:theme.bg}}>
          <b>Webhook URL:</b>
          <WebhookInput readOnly type="text" value={user.currentIP+'/action'} />
        </Webhook>}
        {!noBots && bots.bots.map((b,i)=>{
          return <Bot key={i} bot={b} />
        })}
        <CreateNew>
          <Button onClick={()=>setShowCreate(true)} color="primary">New Bot</Button>
        </CreateNew>
      </>}
      {showCreate && <ShowCreate style={{background:theme.bg}}>
        <TextField
          label="Bot Name" type="text" value={name}
          inputProps={{ style: { textAlign: 'center' } }}
          onChange={(e)=>setName(e.target.value)}
        />
        <Button onClick={()=>createBot()} color="primary" style={{marginTop:35}}
          disabled={!name} loading={creating}>
          Create
        </Button>
      </ShowCreate>}
    </Wrap>
  })
}

function Bot({bot}){
  const [show,setShow] = useState(false)
  return <BotWrap style={{background:theme.bg}}>
    <Row>
      <BotItem><span>Name:</span><b>{bot.name}</b></BotItem>
      <BotItem><span>ID:</span><b>{bot.id}</b></BotItem>
    </Row>
    <BotItem>
      <span>Secret:</span>
      <Secret readOnly type={show?'text':'password'} value={bot.secret} 
        style={{textOverflow:show?'ellipsis':'initial'}}
      />
      {show ? <VisibilityOffIcon onClick={()=>setShow(!show)} style={{fontSize:18,color:'white',cursor:'pointer'}} /> :
        <VisibilityIcon onClick={()=>setShow(!show)} style={{fontSize:18,color:'white',cursor:'pointer'}} />
      }
    </BotItem>
    <BotIcon style={{position:'absolute',left:10,top:10,height:14,width:14}} />
  </BotWrap>
}
function BotIcon({style}){
  return <SvgIcon style={style} viewBox="64 64 896 896" fill="#ddd">
    <path d="M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
  </SvgIcon>
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
`
const Zero = styled.div`
  color:white;
  margin-top:40px;
`
const BotWrap = styled.div`
  width:400px;
  padding:23px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.45);
  position:relative;
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
