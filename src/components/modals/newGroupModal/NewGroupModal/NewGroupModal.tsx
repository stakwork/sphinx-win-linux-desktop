import React, { useState } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../../store'
import { Portal } from 'react-native-paper'
import ModalWrap from '../../modalWrap'
import Header from '../header'
import FadeView from '../../../utils/fadeView'
import Final from '../final'
import People from '../people'
import NewTribe from '../newTribe'
import { Begin } from './components'
import styles from './styles'

const GROUP_SIZE_LIMIT = 20

export default function NewGroup({ visible }) {
  const { ui, contacts } = useStores()
  const [selected, setSelected] = useState([])
  const [next, setNext] = useState(false)
  const [theMode, setMode] = useState('')

  function close() {
    ui.setNewGroupModal(false)
    ui.setEditTribeParams(null)
    setTimeout(() => {
      setNext(false)
      setMode('')
      setSelected([])
    }, 200)
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