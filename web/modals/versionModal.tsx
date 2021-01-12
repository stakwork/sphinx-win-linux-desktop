import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal';
import { useStores } from '../../src/store'
import styled from 'styled-components'
import theme from '../theme'
import * as ipc from '../crypto/ipc'

export default function ViewTribe() {
  const { ui } = useStores()

  function handleClose() {
    ui.setShowVersionDialog(false)
  }
  function openLink(){
    ipc.send(`link`, {link:'https://sphinx.chat'})
  }

  return <Modal
    open={true}
    onClose={handleClose}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Content bg={theme.bg}>
      <Title>Version Update</Title>
      <Text>
        <P>Your app version is outdated. Please update!</P>
        <A style={{color:theme.primary}} onClick={openLink}>
          https://sphinx.chat
        </A>
      </Text>
    </Content>
  </Modal>
}
const Content = styled.div`
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  min-height: 170px;
  background: ${p => p.bg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  max-height: 80vh;
  overflow: auto;
`
const Title = styled.h3`
  color:white;
`
const Text = styled.div`
  display:flex;
  flex-direction:column;
  margin-bottom:15px;
`
const P = styled.p`
  color:white;
`
const A = styled.a`
  text-align:center;
  cursor:pointer;
`