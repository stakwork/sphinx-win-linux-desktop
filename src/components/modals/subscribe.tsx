import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, Image} from 'react-native'
import {Button, Portal} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'
import { constants } from '../../constants'

const conversation = constants.chat_types.conversation

export default function Subscribe({visible}) {
  const { ui, chats, contacts } = useStores()
  const [loading,setLoading] = useState(false)

  function close(){
    ui.setSubModalParams(null)
  }
  const params = ui.subModalParams

  async function subscribe(){
    setLoading(true)
    let contact = contacts.contacts.find(c=>c.public_key===params.publicKey)
    if(!contact) { // create contact if not exist
      const r = await contacts.addContact({
        public_key: params.publicKey,
        alias: params.name,
      })
      contact = r
    }
    let chatId
    const chatForContact = chats.chats.find(c=>{
      return c.type===conversation && c.contact_ids.includes(contact.id)
    })
    if(chatForContact) chatId = chatForContact.id

    const contactId = contact&&contact.id

    await contacts.createSubscription({
      ...contactId && {contact_id:contactId},
      ...chatId && {chat_id:chatId},
      amount: params.amount,
      interval: params.interval||'daily',
      end_number: params.endNumber || 10,
    })
    setLoading(false)
    close()
  }

  const intervals={
    daily:'day',
    weekly:'week',
    monthly:'month',
  }
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="Subscribe" onClose={()=>close()} />

      {params && <View style={styles.content}>
        {params.imgurl && <Image source={{uri:params.imgurl}} 
          style={{width:120,height:120,borderRadius:75,marginTop:15}} resizeMode={'cover'}
        />}

        <Text style={{marginTop:32,fontWeight:'bold',fontSize:28}}>
          {params.name}
        </Text>

        <Text style={{marginTop:32,fontSize:52}}>
          {params.amount}
        </Text>
        <Text style={{fontSize:18,color:'#ccc'}}>
          sat/{intervals[params.interval]||'day'}
        </Text>

        <View style={{marginTop:32,display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:18,marginRight:4}}>
            Total payments: 
          </Text>
          <Text style={{fontSize:18,color:'#aaa'}}>
            {params.endNumber}
          </Text>
        </View>

        <Button onPress={subscribe} mode="contained"
          dark={true} style={styles.button} loading={loading}>
          Subscribe
        </Button>
      </View>}
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
    justifyContent:'flex-start',
    width:'100%',
    paddingBottom:100,
  },
  button:{
    borderRadius:30,
    width:'80%',
    height:60,
    display:'flex',
    justifyContent:'center',
    position:'absolute',
    bottom:35,
  },
})