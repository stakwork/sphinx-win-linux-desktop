import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, TextInput} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import Form from '../form'
import * as schemas from '../form/schemas'
import ModalWrap from './modalWrap'
import Header from './modalHeader'
import {createContactPic,usePicSrc} from '../utils/picSrc'

export default function EditContact({visible}) {
  const { ui, contacts } = useStores()
  const [loading, setLoading] = useState(false)
  function close(){
    ui.closeEditContactModal()
  }
  const contact = ui.editContactParams

  async function updateContact(values){
    setLoading(true)
    if(contact.alias!==values.alias) {
      await contacts.updateContact(contact.id, {
        alias: values.alias
      })
    }
    if(values.photo){
      await createContactPic(contact.id, values.photo)
      contacts.updatePhotoURI(contact.id, values.photo)
    }
    setLoading(false)
    close()
  }

  const uri = usePicSrc(contact)

  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Edit Contact" onClose={()=>close()} />

      <View style={styles.former}>
        <Form schema={schemas.contact} loading={loading} 
          buttonText="Save"
          initialValues={contact?{
            alias: contact.alias,
            public_key: contact.public_key,
            photo: uri?`file://${uri}`:''
          }:{}}
          readOnlyFields={'public_key'}
          onSubmit={values=> updateContact(values)}
        />
      </View>

    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
  },
  former:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    width:'100%',
    paddingBottom:20
  },
})