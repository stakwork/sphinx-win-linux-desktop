import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, useTheme } from '../../store'
import {View, Text, StyleSheet, ScrollView} from 'react-native'
import {Button, Portal, IconButton, Switch} from 'react-native-paper'
import Form from '../form'
import * as schemas from '../form/schemas'
import ModalWrap from './modalWrap'
import {usePicSrc} from '../utils/picSrc'
import FadeView from '../utils/fadeView'
import { constants } from '../../constants'
import ConfirmDialog from '../utils/confirmDialog'

const conversation = constants.chat_types.conversation

export default function EditContact({visible}) {
  const { ui, contacts, chats } = useStores()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [sub,setSub] = useState(false)
  const [existingSub, setExistingSub] = useState(null)
  const [showConfirm,setShowConfirm] = useState(false)
  function close(){
    ui.closeEditContactModal()
  }
  const contact = ui.editContactParams

  useEffect(()=>{
    if(visible) fetchSubscription() // fetch it each time its made visible
  },[visible])
  async function fetchSubscription(){
    const chat = chatForContact()
    const isConversation = chat&&chat.type===constants.chat_types.conversation
    if(isConversation){
      const s = await contacts.getSubscriptionForContact(contact.id)
      if(s && s[0]) setExistingSub(s[0])
    }
  }

  async function updateContact(values){
    setLoading(true)
    if(contact.alias!==values.alias) {
      await contacts.updateContact(contact.id, {
        alias: values.alias
      })
    }
    setLoading(false)
    close()
  }

  function chatForContact(){
    const cfc = chats.chats.find(c=>{
      return c.type===conversation && c.contact_ids.includes(contact.id)
    })
    return cfc
  }

  async function createOrEditSubscription(v){
    const cfc = chatForContact()
    if(!cfc) return console.log('no chat')
    setLoading(true)
    if(existingSub) {
      const s = await contacts.editSubscription(existingSub.id, {
        ...v, chat_id:cfc.id, contact_id:contact.id
      })
      setExistingSub(s)
    } else {
      const s = await contacts.createSubscription({
        ...v, chat_id:cfc.id, contact_id:contact.id
      })
      setExistingSub(s)
    }
    setLoading(false)
    setSub(false)
  }

  async function toggleSubscription(sid,paused:boolean){
    const ok = await contacts.toggleSubscription(sid,paused)
    if(ok) setExistingSub(current=>{
      return {...current,paused}
    })
  }

  const uri = usePicSrc(contact)

  function makeSubValues(){
    const initialSubValues:{[k:string]:any} = {}
    if(existingSub){
      const amountIsCustom = existingSub.amount!==500 && existingSub.amount!==1000 && existingSub.amount!==2000
      if(amountIsCustom) {
        initialSubValues.amount = {selected:'custom',custom:existingSub.amount}
      } else {
        initialSubValues.amount = {selected:existingSub.amount}
      }
      initialSubValues.interval = {selected:existingSub.interval}
      if(existingSub.end_number){
        initialSubValues.endRule = {selected:'number',custom:existingSub.end_number}
      } else if(existingSub.end_date){
        initialSubValues.endRule = {selected:'date',custom:existingSub.end_date}
      }
    }
    return initialSubValues
  }
  function parseSubValues(v){
    const amountIsCustom = v.amount.selected==='custom' && v.amount.custom
    const endRuleIsNumber = v.endRule.selected==='number' && v.endRule.custom
    const endRuleIsDate = v.endRule.selected==='date' && v.endRule.custom
    const body = {
      amount: amountIsCustom ? v.amount.custom : v.amount.selected,
      interval: v.interval.selected,
      ...endRuleIsNumber && {end_number:v.endRule.custom},
      ...endRuleIsDate && {end_date:v.endDate.custom},
    }
    return body
  }

  const subPaused = (existingSub&&existingSub.paused)?true:false
  return useObserver(() => <ModalWrap onClose={close} visible={visible} propagateSwipe={true} noSwipe>
    <Portal.Host>
      <View style={styles.header}>
        <View style={styles.headerLefty}>
          <IconButton
            icon="arrow-left" color="grey" size={22}
            style={{marginRight:14,marginTop:8}}
            onPress={()=>{
              if(sub) setSub(false)
              else close()
            }}
          />
        </View>
        <Text style={{...styles.headerTitle,color:theme.title}}>
          {sub?'Recurring':'Edit Contact'}
        </Text>
        <View style={styles.subWrap}>
          {!sub && <Button style={styles.subscribe}
            onPress={()=>setSub(true)}
            mode="contained" dark={true}>
            <Text style={{fontSize:9}}>{existingSub?'Subscribed':'Subscribe'}</Text>
          </Button>}
          {(sub && existingSub && existingSub.id) && <View style={styles.row}>
            <IconButton
              icon="trash-can-outline"
              color="grey" size={22} style={{marginRight:12}}
              onPress={()=>setShowConfirm(true)}
            />
            <View style={styles.row}>
              <Text style={styles.pausedText}>{subPaused?'PAUSED':'ACTIVE'}</Text>
              <Switch value={!subPaused} 
                onValueChange={()=> toggleSubscription(existingSub.id, subPaused?false:true)}
              />
            </View>
          </View>}
        </View>
      </View>

      <FadeView opacity={!sub?1:0} style={styles.fader}>
        <View style={styles.former}>
          <Form schema={schemas.contact} loading={loading} 
            buttonText="Save"
            initialValues={contact?{
              alias: contact.alias,
              public_key: contact.public_key,
              photo: uri||'',
              route_hint: contact.route_hint,
            }:{}}
            readOnlyFields={'public_key'}
            onSubmit={values=> updateContact(values)}
          />
        </View>
      </FadeView>

      <FadeView opacity={sub?1:0} style={styles.fader}>
        <ScrollView style={styles.scroller} contentContainerStyle={styles.container}>
          <Form schema={schemas.subscribe} loading={loading} nopad
            buttonText="Subscribe"
            initialValues={makeSubValues()}
            onSubmit={v=> {
              const body = parseSubValues(v)
              createOrEditSubscription(body)
            }}
          />
        </ScrollView>
      </FadeView>

      <ConfirmDialog 
        open={showConfirm}
        onClose={()=> setShowConfirm(false)}
        onConfirm={()=>{
          setShowConfirm(false)
          contacts.deleteSubscription(existingSub.id)
          setSub(false)
          setExistingSub(null)
        }}
      />

    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
  },
  header:{
    height:50,
    minHeight:50,
    width:'100%',
    paddingLeft:0,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  headerTitle:{
    fontWeight:'bold',
    fontSize:16
  },
  headerLefty:{
    width:101,height:50,
    borderRadius:18,
    marginLeft:5
  },
  subWrap:{
    minWidth:111,
    borderRadius:18,
    marginRight:12,
  },
  subscribe:{
    backgroundColor:'#6289FD',
    height:27,
    width:111,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },
  fader:{
    flex:1,
  },
  former:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    width:'100%',
    paddingBottom:20
  },
  scroller:{
    width:'100%',
    flex:1,
    display:'flex',
  },
  container:{
    width:'100%',
    paddingBottom:20,
  },
  pausedText:{
    fontSize:12,
    color:'grey',
    minWidth:50
  },
  row:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center'
  }
})