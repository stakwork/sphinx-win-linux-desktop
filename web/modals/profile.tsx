import React, { useState } from 'react'
import { useStores } from '../../src/store'
import styled from 'styled-components'
import Modal from '@material-ui/core/Modal';
import theme from '../theme'

export default function ViewContact() {

  const { ui } = useStores()

  function handleCloseModal() {
    ui.setShowProfile(false)
  }

  return <Modal
    open={true}
    onClose={handleCloseModal}
    aria-labelledby="simple-modal-title"
    aria-describedby="simple-modal-description"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Content bg={theme.bg}>
      profile
    </Content>
  </Modal>
}

const Content = styled.div`
  padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 8px;
    width: 300px;
    height: 450px;
    background: ${p => p.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
`
