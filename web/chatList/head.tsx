import React from 'react'
import styled from 'styled-components'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import SearchIcon from '@material-ui/icons/Search';
import theme from '../theme'

export default function Head(){
  const {details,ui} = useStores()
  return useObserver(()=> <Wrap>
    <Top>
      <div></div>
      <Balance>
        {details.balance}
        <span>sat</span>
      </Balance>
      <div></div>
    </Top>
    <Searcher>
      <SearchIcon style={{color:'grey',fontSize:18,position:'absolute',top:12,left:19}} />
      <Search placeholder="Search" value={ui.searchTerm}
        onChange={e=>ui.setSearchTerm(e.target.value)}
        style={{background:theme.deep}}
      />
    </Searcher>
  </Wrap>)
}

const Wrap = styled.div`
  width:100%;
  height:115px;
  max-height:114px;
  display:flex;
  flex-direction:column;
  box-shadow: 0px 0px 14px 0px rgba(0,0,0,0.65);
  position:relative;
  z-index:11;
`
const Top=styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  width:100%;
  height:65px;
`
const Balance=styled.div`
  width:100px;
  font-size:17px;
  & span {
    color:grey;
    margin-left:10px;
  }
`
const Searcher=styled.div`
  width:100%;
  position:relative;
`
const Search=styled.input`
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