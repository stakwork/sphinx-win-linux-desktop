import React, { useState } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import { StyleSheet } from 'react-native'
import { Portal, Button } from 'react-native-paper'
import ModalWrap from '../modalWrap'
import Header from './header'
import FadeView from '../../utils/fadeView'
import Final from './final'
import People from './people'
import NewTribe from './newTribe'

const GROUP_SIZE_LIMIT = 20

export default function NewGroup({ visible }) {
  const { ui, contacts } = useStores()
  const [selected, setSelected] = useState([])
  const [next, setNext] = useState(false)
  const [theMode, setMode] = useState('')

  function close() {
    ui.setNewGroupModal(false)
    ui.setEditTribeParams(null)
    // setTimeout(() => {
    //   setNext(false)
    //   setMode('')
    //   setSelected([])
    // }, 200)
  }
  const contactsToShow = contacts.contacts.filter(c => c.id > 1)
  const selectedContacts = contactsToShow.filter(c => selected.includes(c.id))
  const showSelectedContacts = selectedContacts.length > 0

  let mode = theMode
  if (ui.editTribeParams) mode = 'tribe'

  let title = 'New Group'
  if (mode === 'tribe') title = 'New Tribe'
  if (ui.editTribeParams) title = 'Edit Tribe'
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title={title} onClose={() => close()}
        showNext={!next && showSelectedContacts} next={() => setNext(true)}
      />

      <FadeView opacity={mode === '' ? 1 : 0} style={styles.contentVerticallyCentered}>
        <Begin setMode={setMode} />
      </FadeView>

      <FadeView opacity={mode === 'tribe' ? 1 : 0} style={styles.contentVerticallyCentered}>
        <NewTribe onFinish={close} />
      </FadeView>

      <FadeView opacity={mode === 'group' && !next ? 1 : 0} style={styles.content}>
        <People setSelected={setSelected} limit={GROUP_SIZE_LIMIT} />
      </FadeView>

      <FadeView opacity={mode === 'group' && next ? 1 : 0} style={styles.content}>
        <Final onFinish={close} contactIds={selected} />
      </FadeView>

    </Portal.Host>
  </ModalWrap>)
}

function Begin({ setMode }) {
  return <>
    <Button mode="contained" dark={true}
      accessibilityLabel="new-group-group-button"
      onPress={() => setMode('group')}
      style={{ backgroundColor: '#55D1A9', borderRadius: 30, width: '75%', height: 60, display: 'flex', justifyContent: 'center' }}>
      Private Group
    </Button>
    <Button mode="contained" dark={true}
      accessibilityLabel="new-group-tribe-button"
      onPress={() => setMode('tribe')}
      style={{ backgroundColor: '#6289FD', borderRadius: 30, width: '75%', height: 60, display: 'flex', justifyContent: 'center', marginTop: 28 }}>
      Sphinx Tribe
    </Button>
  </>
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 40,
  },
  contentVerticallyCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

