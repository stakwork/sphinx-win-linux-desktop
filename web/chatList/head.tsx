import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStores } from '../../src/store'
import { useObserver } from 'mobx-react-lite'
import SearchIcon from '@material-ui/icons/Search';
import theme from '../theme'
import FlashOnButton from '@material-ui/icons/FlashOn';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import CachedButton from '@material-ui/icons/Cached';
import ArrowBackIosButton from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosButton from '@material-ui/icons/ArrowForwardIos';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import EE, {RESET_IP, RESET_IP_FINISHED} from '../utils/ee'

export default function Head({ setWidth, width }) {
  const { contacts, details, msg, ui, chats } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // const [snap, setSnap] = useState(false) =
  const snap = width < 250

  async function refresh() {
    setRefreshing(true)
    await Promise.all([
      contacts.getContacts(),
      details.getBalance(),
      msg.getMessages(true),
      // chats.getChats(),
    ])
    setRefreshing(false)
  }

  function startResetIP(){
    setRefreshing(true)
  }

  useEffect(()=>{
    refresh()
    
    EE.on(RESET_IP, startResetIP)
    EE.on(RESET_IP_FINISHED, refresh)
    return ()=>{
      EE.removeListener(RESET_IP, startResetIP)
      EE.removeListener(RESET_IP_FINISHED, refresh)
    }
  },[])

  function setWidthHandler(width: number) {
    setWidth(width)
  }

  return useObserver(() => <Wrap>
    {snap ? <div></div> :
      <Top style={{ overflow: 'hidden' }}>
        <Tooltip title="Refresh" placement="right">
          <CachedButton style={{ cursor: 'pointer', marginLeft: 20, marginRight: 20 }} onClick={() => refresh()} >
          </CachedButton>
        </Tooltip>
        <div></div>
        <Balance>
          {details.balance}
          <span>sat</span>
        </Balance>
        <div></div>
        <Tooltip title={ui.connected ? 'Connected' : 'Not Connected'} placement="left">
          {refreshing ?
            <CircularProgress size={18} style={{ marginRight: 20, marginLeft: -20, color: 'white' }} /> :
            <FlashOnButton style={{
              marginRight: 20, marginLeft: -20, height: 20,
              color: ui.connected ? '#49ca97' : '#febd59'
            }} />
          }
        </Tooltip>
      </Top>}
    {snap ? <div></div> :
      <Searcher>
        <SearchIcon style={{ color: 'grey', fontSize: 18, position: 'absolute', top: 12, left: 19 }} />
        <Search placeholder="Search" value={ui.searchTerm}
          onChange={e => ui.setSearchTerm(e.target.value)}
          style={{ background: theme.deep, marginRight: 5 }}
        />
        <PersonAddIcon onClick={()=>ui.setNewContact(true)} style={{color: '#8e9da9', position: 'absolute', right: '24px', marginTop: '9px', cursor: 'pointer'}}/>
        <ArrowBackIosButton onClick={() => setWidthHandler(11)}
          style={{
            fontWeight: 'bold', color: '#618af8', fontSize: 'medium', cursor: 'pointer',
            position: 'absolute', right: '0px', marginTop: 13
          }}>
        </ArrowBackIosButton>
      </Searcher>}
    {snap ?
      <ArrowForwardIosButton onClick={() => setWidthHandler(350)}
        style={{
          cursor: 'pointer', borderTopRightRadius: '5px', borderBottomRightRadius: '5px', backgroundColor: '#618af8',
          position: 'absolute', right: '-26px', top: '73px', paddingTop: 5, paddingBottom: 5, width: 16
        }} />
      : <div></div>}
  </Wrap>)
}

const Wrap = styled.div`
  width:100%;
  height:115px;
  max-height:114px;
  display:flex;
  flex-direction:column;
  box-shadow: 0px 0px 14px 0px rgba(0,0,0,0.55);
  position:relative;
  z-index:11;
`
const Top = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  width:100%;
  height:65px;
`
const Balance = styled.div`
  width:100px;
  font-size:17px;
  & span {
    color:grey;
    margin-left:10px;
  }
`
const Searcher = styled.div`
  width:100%;
  position:relative;
  display: flex;
`
const Search = styled.input`
  width: calc(100% - 65px);
  height:42px;
  border:none;
  outline:none;
  border-radius:32px;
  font-size:14px;
  padding-left:42px;
  padding-right:48px;
  color:grey;
  margin-left:8px;
`