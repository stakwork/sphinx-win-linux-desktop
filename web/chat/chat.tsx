import React from 'react'
import styled from 'styled-components'
import Head from './head'
import theme from '../theme'

function Chat(){
  return <Section style={{background:theme.deep}}>
    <Head />
  </Section>
}

const Section=styled.section`
  height:100%;
  flex:1;
`

export default Chat