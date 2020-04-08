import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, StyleSheet, Text, TextInput, Dimensions} from 'react-native'
import ModalWrap from './modalWrap'
import {Button,Avatar} from 'react-native-paper'
import Header from './modalHeader'
import NumKey from '../utils/numkey'

export default function SendPayment({visible}) {
  const {ui,msg,contacts} = useStores()
  const [amt, setAmt] = useState('0')
  const [text, setText] = useState('')
  const [inputFocused,setInputFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const chat = ui.chatForPayModal

  const contact_id = chat && chat.contact_ids && chat.contact_ids.find(cid=>cid!==1)

  const contact = contact_id && contacts.contacts.find(c=> c.id===contact_id)

  async function sendPayment(amt){
    if(!amt) return
    setLoading(true)
    let theContactId=null
    if(!chat.id){ // if no chat (new contact)
      theContactId=chat.contact_ids.find(cid=>cid!==1)
    }
    await msg.sendPayment({
      contact_id:theContactId,
      amt,
      chat_id: chat.id||null,
      destination_key:''
    })
    setLoading(false)
    ui.clearPayModal()
  }

  async function sendInvoice(amt,text) {
    if(!amt) return
    setLoading(true)
    let theContactId=null
    if(!chat.id){ // if no chat (new contact)
      theContactId=chat.contact_ids.find(cid=>cid!==1)
    }
    await msg.sendInvoice({
      contact_id:theContactId,
      amt,
      memo: text,
      chat_id: chat.id||null,
    })
    setLoading(false)
    ui.clearPayModal()
  }

  function clearOut(){
    setTimeout(()=>{
      setAmt('0')
      setText('')
    },500)
  }
  async function confirm(amt,text){
    if(ui.payMode==='payment') await sendPayment(amt)
    if(ui.payMode==='invoice') await sendInvoice(amt, text)
    clearOut()
  }
  function close(){
    if(!loading){
      ui.clearPayModal()
      clearOut() 
    }
  }
  function go(n){
    if(amt==='0') setAmt(`${n}`)
    else setAmt(`${amt}${n}`)
  }
  function backspace(){
    if(amt.length===1){
      setAmt('0')
    } else {
      const newAmt = amt.substr(0, amt.length-1)
      setAmt(newAmt)
    }
  }

  const height = Math.round(Dimensions.get('window').height) - 28

  return useObserver(() =>{
    const label = ui.payMode==='payment'?'Send Payment':'Request Payment'
    return <ModalWrap visible={visible} onClose={close}>
      <Header title={label} onClose={()=>close()} />

      <View style={{...styles.wrap,maxHeight:height,minHeight:height}}>

        <View style={styles.top}>
          <View style={styles.contactWrap}>
            <Avatar.Image
              source={require('../../../assets/avatar.png')}
              size={32}
            />
            {contact && <View style={styles.contactAliasWrap}>
              <Text style={styles.contactAliasLabel}>{ui.payMode==='invoice'?'From':'To'}</Text>
              <Text>{contact.alias}</Text>
            </View>}
          </View>
          <View style={styles.amtWrap}>
            <View style={styles.amtInnerWrap}>
              <Text style={styles.amt}>{amt}</Text>
              <Text style={styles.sat}>sat</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.bottomInner}>

           <View style={styles.confirmWrap}>
              {amt&&amt!=='0'&&<Button style={styles.confirm}
                loading={loading}
                onPress={()=> confirm(parseInt(amt),text)}
                mode="contained" dark={true}>
                CONFIRM
              </Button>}
            </View>

            <NumKey onKeyPress={v=> go(v)} onBackspace={()=> backspace()} 
              squish
            />

            {ui.payMode==='invoice' && <View style={styles.memoWrap}>
              <TextInput value={text} placeholder="Add Message"
                onChangeText={v=> setText(v)}
                style={{...styles.input,
                  borderBottomColor:inputFocused?'#6289FD':'#ddd'
                }}
                onFocus={()=> setInputFocused(true)}
                onBlur={()=> setInputFocused(false)}
              />
            </View>}

          </View>
        </View>

      </View>
    </ModalWrap>
  })
}

const styles=StyleSheet.create({
  wrap:{
    flex:1,
    justifyContent:'space-between',
  },
  contactWrap:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:5
  },
  contactAliasWrap:{
    marginLeft:10,
    display:'flex',
    flexDirection:'column',
  },
  contactAliasLabel:{
    color:'#ccc',
    fontSize:11
  },
  amtWrap:{
    width:'100%',
    display:'flex',
    flexGrow:1,
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
  },
  amtInnerWrap:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    position:'relative',
  },
  amt:{
    fontSize:48,
    color:'black',
  },
  sat:{
    position:'absolute',
    right:25,
    fontSize:24,
    color:'#ccc',
  },
  confirmWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    height:100,
    marginTop:12,
    marginBottom:19
  },
  confirm:{
    backgroundColor:'#6289FD',
    height:35,
    width:150,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },
  memoWrap:{
    width:'80%',
    marginLeft:'10%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10
  },
  input:{
    height:42,
    maxHeight:42,
    flex:1,
    marginBottom:5,
    backgroundColor:'#fff',
    textAlign:'center',
    borderBottomWidth:1,
    fontSize:16
  },
  top:{
    width:'100%',
    position:'absolute',
    top:0,left:0,right:0,
    height:'25%'
  },
  bottom:{
    width:'100%',
    position:'absolute',
    bottom:0,left:0,right:0,
    height:'75%',
  },
  bottomInner:{
    flex:1,
    flexGrow:1,
    flexDirection:'column-reverse',
  }
})
