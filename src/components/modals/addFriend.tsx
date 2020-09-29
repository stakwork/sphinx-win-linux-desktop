import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, StyleSheet} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import FadeView from '../utils/fadeView'
import Form from '../form'
import {contact} from '../form/schemas'
import ModalWrap from './modalWrap'
import Header from './modalHeader'
import InviteNewUser from './inviteNewUser'

export default function AddFriend({visible}) {
  const { ui, contacts } = useStores()
  const [hideButtons, setHideButtons] = useState(false)
  const [addContact, setAddContact] = useState(false)
  const [inviteNewUser, setInviteNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  function close(){
    ui.setAddFriendModal(false)
    setTimeout(()=>{
      setHideButtons(false)
      setAddContact(false)
      setInviteNewUser(false)
    },200)
  }
  function onNewToSphinxHandler() {
    setHideButtons(true)
    setTimeout(()=> setInviteNewUser(true), 100)
  }
  function onAlreadyOnSphinxHandler() {
    setHideButtons(true)
    setTimeout(()=> setAddContact(true), 100)
  }
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Add Friend" onClose={close} />

      <FadeView opacity={hideButtons?0:1} style={styles.content}>
        <Button mode="contained" dark={true}
          onPress={onNewToSphinxHandler}
          style={{backgroundColor:'#55D1A9',borderRadius:30,width:'75%',height:60,display:'flex',justifyContent:'center'}}>
          New to Sphinx
        </Button>
        <Button mode="contained" dark={true}
          onPress={onAlreadyOnSphinxHandler}
          style={{backgroundColor:'#6289FD',borderRadius:30,width:'75%',height:60,display:'flex',justifyContent:'center',marginTop:28}}>
          Already on Sphinx
        </Button>
      </FadeView>

      <FadeView opacity={addContact?1:0} style={styles.content}>
        <View style={styles.former}>
          <Form schema={contact} loading={loading} 
            buttonText="Save to Contacts"
            onSubmit={async (values)=> {
              setLoading(true)
              await contacts.addContact(values)
              setLoading(false)
              close()
            }}
          />
        </View>
      </FadeView>

      <FadeView opacity={inviteNewUser?1:0} style={styles.content}>
        {inviteNewUser && <InviteNewUser done={close} />}
      </FadeView>

    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
  },
  content:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    marginBottom:40,
  },
  former:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    width:'100%',
  },
})