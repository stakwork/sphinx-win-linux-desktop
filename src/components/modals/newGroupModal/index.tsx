import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {StyleSheet} from 'react-native'
import {Portal} from 'react-native-paper'
import ModalWrap from '../modalWrap'
import Header from './header'
import FadeView from '../../utils/fadeView'
import Final from './final'
import People from './people'

const GROUP_SIZE_LIMIT = 20

export default function NewGroup({visible}) {
  const { ui, contacts } = useStores()
  const [selected, setSelected] = useState([])
  const [next, setNext] = useState(false)

  function close(){
    ui.setNewGroupModal(false)
    setTimeout(()=>{
      setNext(false)
      setSelected([])
    },200)
  }
  const contactsToShow = contacts.contacts.filter(c=> c.id>1)
  const selectedContacts = contactsToShow.filter(c=> selected.includes(c.id))
  const showSelectedContacts = selectedContacts.length>0

  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="New Group" onClose={()=>close()} 
        showNext={!next && showSelectedContacts} next={()=>setNext(true)}
      />

      <FadeView opacity={next?0:1} style={styles.content}>
        <People setSelected={setSelected} limit={GROUP_SIZE_LIMIT} />
      </FadeView>

      <FadeView opacity={next?1:0} style={styles.content}>
        <Final onFinish={close} contactIds={selected} />
      </FadeView>

    </Portal.Host>
  </ModalWrap>)
}



const styles = StyleSheet.create({
  content:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    marginBottom:40,
  },
})

