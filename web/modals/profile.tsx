import React, { useState } from 'react'
import { useStores } from '../../src/store'
import styled from 'styled-components'
import Modal from '@material-ui/core/Modal';
import theme from '../theme'
import Avatar from '../utils/avatar'
import Toggle from '../utils/toggle'
import Form from '../form'
import * as Yup from 'yup'
import { contact } from '../../src/store/websocketHandlers';


const schema = [{
  name: 'alias',
  type: 'text',
  label: 'User Name',
  validator: Yup.string().required('Required'),
},{
  name: 'public_key',
  type: 'text',
  label: 'Address',
  readOnly: true
}]

const advSchema = [{
  name: 'currentIP',
  type: 'text',
  label: 'Server URL',
  validator: Yup.string().required('Required'),
}]

export default function Profile() {

  const { ui, contacts, details, user } = useStores()
  const me = contacts.contacts.find(c => c.id === 1)
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function updateMe(v){
    setLoading(true)
    await contacts.updateContact(1, {alias: v.alias})
    setLoading(false)
  }

  console.log(me)

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
      <TopWrapper>
        <Avatar xx-large photo={me.photo_url} alias={me.alias} style={{size: '50px'}} />
        <InnerTopWrapper>
          <Name>{me.alias.toUpperCase()}</Name>
          <Sat>{details.balance} <span style={{color: '#6b7b8d'}}>sat</span></Sat>
        </InnerTopWrapper>
      </TopWrapper>
      <Toggle onChange={e=>setAdvanced(e==='Advanced')} items={['Basic', 'Advanced']} value={advanced?'Advanced':'Basic'}/>
              {advanced?
              <Form key={'adv'} onSubmit={v=>user.setCurrentIP(v.currentIP)} schema={advSchema} initialValues={{currentIP: user.currentIP}}/>
              :
              <Form key={'basic'} onSubmit={updateMe} schema={schema} initialValues={me} loading={loading}/>}
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
const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: row;
  width: 100%;
  height: 150px;
`

const InnerTopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 150px;
`

const Name = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
`

const Sat = styled.div`

`
