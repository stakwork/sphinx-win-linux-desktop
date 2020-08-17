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

export default function Head({ setWidth }) {
  const { contacts, details, msg, ui } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [snap, setSnap] = useState(false)

  async function refresh() {
    setRefreshing(true)
    await Promise.all([
      contacts.getContacts(),
      details.getBalance(),
      msg.getMessages(),
    ])
    setRefreshing(false)
  }

  return useObserver(() => <Wrap>
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
          <CircularProgress size='24px' style={{ marginRight: 20, marginLeft: -20, color: '#49ca97' }} /> :
          <FlashOnButton style={{
            marginRight: 20, marginLeft: -20, height: 20,
            color: ui.connected ? '#49ca97' : '#febd59'
          }} />
        }
      </Tooltip>
    </Top>
    <Searcher>
      <SearchIcon style={{ color: 'grey', fontSize: 18, position: 'absolute', top: 12, left: 19 }} />
      <Search placeholder="Search" value={ui.searchTerm}
        onChange={e => ui.setSearchTerm(e.target.value)}
        style={{ background: theme.deep, marginRight: 5 }}
      />
      <ArrowBackIosButton onClick={() => {setWidth(11), setSnap(true)}} style={{ color: '#618af8', fontSize: 'medium', cursor: 'pointer', position: 'absolute', float: 'right', marginTop: 13 }}>
      </ArrowBackIosButton>
    </Searcher>
    {snap?
    <ArrowForwardIosButton onClick={() => {setWidth(350), setSnap(false)}} style={{ cursor: 'pointer', borderTopRightRadius: '5px', borderBottomRightRadius: '5px', backgroundColor: '#618af8', position: 'absolute', right: '-35px', top: '73px', paddingTop: 5, paddingBottom: 5 }} />
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
`
const Search = styled.input`
  width:90%;
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