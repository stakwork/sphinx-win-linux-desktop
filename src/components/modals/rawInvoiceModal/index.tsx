import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, Image, StyleSheet} from 'react-native'
import Modal from "../modalWrap"
import { Button } from 'react-native-paper'
import Header from '../modalHeader'
import ShowRawInvoice from './showRawInvoice'

export default function RawInvoiceModal({visible}) {
  const { ui,msg } = useStores()
  const [loading, setLoading] = useState(false)
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

        {hasPayreq && <ShowRawInvoice
          amount={params&&params.amount}
          payreq={payreq}
        />}

      </View>
    </Modal>
  })
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    width:'100%',
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
})