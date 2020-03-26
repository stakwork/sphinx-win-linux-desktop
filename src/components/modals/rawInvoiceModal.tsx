import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, Image, StyleSheet, Clipboard} from 'react-native'
import Modal from "./modalWrap"
import { Button, Snackbar } from 'react-native-paper'
import Header from './modalHeader'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share'

export default function RawInvoiceModal({visible}) {
  const { ui,msg } = useStores()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [payreq, setPayreq] = useState('')

  function close(){
    ui.clearRawInvoiceModal()
  }

  async function createInvoice(){
    setLoading(true)
    const params = ui.rawInvoiceModalParams
    const amt = (params.amount && parseInt(params.amount)) || 0
    const r = await msg.createRawInvoice({amt, memo:''})
    if(r && r.invoice){
      setPayreq(r.invoice)
    }
    setLoading(false)
  }

  function copy(){
    Clipboard.setString(payreq)
    setCopied(true)
  }
  async function share(){
    try{
      await Share.open({message:payreq})
    } catch(e){}
  }

  return useObserver(() => {
    const params = ui.rawInvoiceModalParams
    const hasPayreq = payreq?true:false
    return <Modal visible={visible} onClose={close}>
      <Header title="Payment Request" onClose={close} />
      <View style={styles.wrap}>
        
        {params && !hasPayreq && <View style={styles.innerWrap}>
          <Text style={styles.genText}>Generate Invoice</Text>
          {params.imgurl && <Image source={{uri:params.imgurl}} style={styles.img} />}
          {params.name && <Text style={styles.genText}>{params.name}</Text>}
          {params.amount && <Text style={styles.amt}>{params.amount}</Text>}
          {params.amount && <Text style={styles.sat}>sat</Text>}
          <View style={styles.confirmWrap}>
            <Button style={styles.confirm}
              loading={loading}
              onPress={()=> createInvoice()}
              mode="contained" dark={true}>
              CONFIRM
            </Button>
          </View>
        </View>}

        {hasPayreq && <View style={styles.innerWrap}>
          {params && <View style={styles.amtWrap}>
            <Text style={{fontSize:16}}>{`Amount: ${params.amount} sats`}</Text>
          </View>}
          <View style={styles.qrWrap}>
            <QRCode value={payreq} size={250} />
          </View>
          <Text style={styles.payreqText}>{payreq}</Text>
          <View style={styles.buttonsWrap}>
            <Button mode="contained" dark={true} 
              onPress={()=> share()} style={styles.button}>
              Share
            </Button>
            <Button mode="contained" dark={true}
              onPress={()=> copy()} style={styles.button}>
              Copy
            </Button>
          </View>
          <Snackbar visible={copied} onDismiss={()=> setCopied(false)}>
            Payment Request Copied!
          </Snackbar>
        </View>}

      </View>
    </Modal>
  })
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-end',
    minHeight:'90%',
    maxHeight:'90%',
  },
  innerWrap:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
  },
  genText:{
    fontSize:24,
    fontWeight:'bold',
    marginBottom:25,
  },
  amt:{
    fontSize:42,
    color:'#333',
  },
  sat:{
    fontSize:16,
    color:'#aaa',
    marginBottom:15,
  },
  img:{
    height:130,
    width:130,
    borderRadius:10,
    marginBottom:25,
  },
  confirmWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    height:100,
    marginTop:12,
  },
  confirm:{
    backgroundColor:'#6289FD',
    height:42,
    width:200,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },

  amtWrap:{
    display:'flex',
    width:'100%',
    justifyContent:'center',
    flexDirection:'row',
    marginTop:5,
  },
  qrWrap:{
    display:'flex',
    flexDirection:'column',
    padding:20,
    width:'100%',
    alignItems:'center',
    marginTop:5
  },
  payreqText:{
    padding:20,
    width:'100%',
    flexWrap:'wrap',
  },
  buttonsWrap:{
    marginTop:20,
    display:'flex',
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-around'
  },
  button:{
    height:46,
    borderRadius:23,
    width:120,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  }
})