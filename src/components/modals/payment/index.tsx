import React, {useState,useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import ModalWrap from '../modalWrap'
import Header from '../modalHeader'
import Main from './main'
import { StyleSheet, Text } from 'react-native'
import FadeView from '../../utils/fadeView'
import ShowRawInvoice from '../rawInvoiceModal/showRawInvoice'
import Scan from './scan'

export default function SendPayment({visible}) {
  const {ui,msg,contacts} = useStores()
  
  const [main, setMain] = useState(false)
  const [next, setNext] = useState('')
  const [loading, setLoading] = useState(false)
  const [rawInvoice, setRawInvoice] = useState(null)
  const [amtToPay, setAmtToPay] = useState(null)

  useEffect(()=>{
    if(visible) setMain(true)
    if(!visible) setTimeout(()=>setMain(false),500)
  },[visible])

  const chat = ui.chatForPayModal

  const contact_id = chat && chat.contact_ids && chat.contact_ids.find(cid=>cid!==1)

  const contact = contact_id && contacts.contacts.find(c=> c.id===contact_id)

  async function sendPayment(amt){
    if(!amt) return
    setLoading(true)
    let theContactId=null
    if(!(chat&&chat.id)){ // if no chat (new contact)
      theContactId=chat&&chat.contact_ids.find(cid=>cid!==1)
    }
    await msg.sendPayment({
      contact_id:theContactId,
      amt,
      chat_id: (chat&&chat.id)||null,
      destination_key:''
    })
    setLoading(false)
    ui.clearPayModal()
  }

  async function sendInvoice(amt,text) {
    if(!amt) return
    setLoading(true)
    let theContactId=null
    if(!(chat && chat.id)){ // if no chat (new contact)
      theContactId = chat && chat.contact_ids.find(cid=>cid!==1)
    }
    const inv = await msg.sendInvoice({
      contact_id:theContactId,
      amt,
      memo: text,
      chat_id: (chat&&chat.id)||null,
    })
    setLoading(false)
    if(chat) ui.clearPayModal() // done (if in a chat)
    return inv
  }

  async function sendContactless(amt,text) {
    if(ui.payMode==='invoice') {
      setLoading(true)
      const inv = await msg.createRawInvoice({amt,memo:text})
      setRawInvoice({...inv, amount:amt})
      setLoading(false)
      setNext(ui.payMode)
    } else if(ui.payMode==='payment') {
      setNext(ui.payMode)
      setAmtToPay(amt)
    }
  }
  async function payContactless(addy){
    setLoading(true)
    await msg.sendPayment({
      contact_id:null, chat_id:null,
      destination_key:addy, amt:amtToPay
    })
    setLoading(false)
    close()
  }

  function clearOut(){
    setTimeout(()=>{
      setAmtToPay(null)
      setNext('')
      setRawInvoice(null)
    })
  }
  async function confirmOrContinue(amt,text){
    if(!chat){
      sendContactless(amt,text)
      return
    }
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
  
  const hasRawInvoice=rawInvoice?true:false
  return useObserver(() =>{
    const label = ui.payMode==='payment'?'Send Payment':'Request Payment'
    return <ModalWrap visible={visible} onClose={close}>
      <Header title={label} onClose={()=>close()} />

      <FadeView opacity={next===''?1:0} style={styles.content}>
        {main && <Main chat={chat}
          contactless={!chat?true:false}
          contact={contact}
          loading={loading}
          confirmOrContinue={confirmOrContinue}
        />}
      </FadeView>

      <FadeView opacity={next==='invoice'?1:0} style={styles.content}>
        {hasRawInvoice && <ShowRawInvoice 
          amount={rawInvoice.amount}
          payreq={rawInvoice.invoice}
        />}
      </FadeView>

      <FadeView opacity={next==='payment'?1:0} style={styles.content}>
        <Scan pay={payContactless} loading={loading} />
      </FadeView>

    </ModalWrap>
  })
}

const styles=StyleSheet.create({
  content:{
    flex:1,
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
  },
})

