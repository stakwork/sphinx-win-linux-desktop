import React, {useState} from 'react'
import styled from 'styled-components'
import Dragger from './dragger'

function ChatList(){
  const [width,setWidth] = useState(400)
  return <Section style={{width,maxWidth:width,minWidth:width}}>
    <Inner>
      <Balance></Balance>
      chat list
    </Inner>
    <Dragger setWidth={setWidth}/>
  </Section>
}

const Section=styled.section`
  height:100%;
  display:flex;
  flex:1;
`
const Balance=styled.div`
  width:100%;
  height:100px;
`
const Inner=styled.div`
  flex:1;
`

export default ChatList