import React from 'react'
import styled from 'styled-components'
import {useStores} from '../../src/store'
import {useObserver} from 'mobx-react-lite'
import theme from '../theme'

export default function Head(){
  const {details,ui} = useStores()
  return useObserver(()=> <Wrap style={{background:theme.bg}}>
    <Placeholder>
      Open a conversation to start using Sphinx
    </Placeholder>
  </Wrap>)
}

const Wrap = styled.div`
  width:100%;
  height:65px;
  max-height:114px;
  display:flex;
  flex-direction:row;
  align-items:center;
  padding-left:20px;
  box-shadow: 5px 0px 17px 0px rgba(0,0,0,0.75);
`
const Placeholder=styled.div`
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#ccc;
`