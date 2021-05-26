import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, useTheme } from '../../store'
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native'
import {Button, Portal, TextInput} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'
// import { useNavigation } from '@react-navigation/native'

export default function Person({visible}) {
  const { ui, chats, msg, contacts } = useStores()
  const theme = useTheme()
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState('')
  // const navigation = useNavigation()

  function close(){
    ui.setPersonParams(null)
  }
  const params = ui.personParams
  const {owner_alias, img, description, owner_pubkey, owner_route_hint, owner_contact_key, price_to_meet} = params

  async function addContactAndSendInitialMessage() {
    setLoading(true)
    const created = await contacts.addContact({
      public_key: owner_pubkey,
      route_hint: owner_route_hint,
      alias: owner_alias,
      contact_key: owner_contact_key,
    })
    const createdMessage = await msg.sendMessage({
      contact_id: created.id,
      chat_id: null,
      text: message,
      amount: price_to_meet,
      reply_uuid: ''
    })
    // const theChatID = createdMessage && createdMessage.chat_id
    // refresh chats
    const cs = await chats.getChats()
    setLoading(false)
    close()
    // if(theChatID){
    //   const theChat = cs.find(c=> c.id===theChatID)
    //   if(theChat){
    //     navigation.navigate('Dashboard', {
    //       screen: 'Chat', params: theChat
    //     })
    //   }
    // }
  }

  const h = Dimensions.get('screen').height
  const already = contacts.findExistingContactByPubkey(owner_pubkey)
  const hasImg = img?true:false
  return useObserver(() => {
    if(already) {
      return <ModalWrap onClose={close} visible={visible}>
        <Portal.Host>
          <Header title="Add Contact" onClose={()=>close()} />
          <View style={styles.content}>
            <Text style={{marginTop:10,marginBottom:10,paddingLeft:15,paddingRight:15,color:theme.title}}>
              You are already connected with this person
            </Text>
          </View>
        </Portal.Host>
      </ModalWrap>
    }
    return <ModalWrap onClose={close} visible={visible}>
      <Portal.Host>
        <Header title="Add Contact" onClose={()=>close()} />

        <View style={styles.content}>
          <Image source={hasImg?{uri:img}:require('../../../android_assets/avatar3x.png')} 
            style={{width:150,height:150,borderRadius:75,marginTop:15}} resizeMode={'cover'}
          />

          {(owner_alias?true:false) && <Text style={{marginTop:15,fontWeight:'bold',fontSize:22,color:theme.title}}>
            {owner_alias}
          </Text>}

          <Text style={{marginTop:10,marginBottom:10,paddingLeft:15,paddingRight:15,color:theme.title}}>
            {description}
          </Text>

          <TextInput mode="outlined"
            placeholder={`Initial message to ${owner_alias}`}
            onChangeText={e=> setMessage(e)}
            value={message}
            style={styles.input}
          />

          <Button onPress={addContactAndSendInitialMessage} mode="contained"
            dark={true} style={{...styles.button,top:h-250}} loading={loading}>
            CONNECT
          </Button>
        </View>
      </Portal.Host>
  </ModalWrap>})
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
    paddingBottom:20
  },
  button:{
    borderRadius:30,
    width:'80%',
    height:60,
    display:'flex',
    justifyContent:'center',
    position:'absolute',
  },
  table:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:5,
    marginTop:15,
    width:240
  },
  tableRow:{
    borderBottomWidth:1,
    borderBottomColor:'#ccc',
    paddingLeft:10,
    paddingRight:10,
    paddingTop:5,
    paddingBottom:5,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  tableRowLabel:{
    minWidth:150,
  },
  tableRowValue:{
    fontWeight:'bold',
    display:'flex',
    alignItems:'center',
    minWidth:62,
    textAlign:'right'
  },
  input:{
    maxHeight:65,
    marginTop:15,
    minWidth:240
  }
})