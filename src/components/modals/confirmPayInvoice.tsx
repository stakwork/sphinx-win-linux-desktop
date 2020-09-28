import React, {useState} from 'react'
import {View, StyleSheet, Text, Dimensions} from 'react-native'
import {IconButton, Button} from 'react-native-paper'
import Modal from 'react-native-modal'
import { useStores } from '../../store'

export default function ConfirmPayInvoice({visible}) {
  const {ui,msg} = useStores()
  const [loading, setLoading] = useState(false)

  function close(){
    ui.setConfirmInvoiceMsg(null)
  }

  async function pay(){
    const req = ui.confirmInvoiceMsg && ui.confirmInvoiceMsg.payment_request
    if(!req) return
    setLoading(true)
    await msg.payInvoice(ui.confirmInvoiceMsg)
    setLoading(false)
    close()
  }

  const height = Math.round(Dimensions.get('window').height)
  const amt = ui.confirmInvoiceMsg && ui.confirmInvoiceMsg.amount
  return (
    <Modal isVisible={visible}
      onSwipeComplete={close}
      style={{...styles.modal,top:height-200}}
      swipeDirection="down" swipeThreshold={20}>
      <View style={styles.main}>
        <Header amt={amt} onClose={close} />
        <View style={styles.confirmWrap}>
          <Button style={styles.confirm}
            loading={loading}
            onPress={pay}
            mode="contained" dark={true}>
            CONFIRM
          </Button>
        </View>
      </View>
    </Modal>
  )
}

function Header(props){
  const {onClose} = props
  return <View style={{...styles.header, ...props.background&&{backgroundColor:props.background}}}>
    <View style={styles.headerLefty}>
      <Text style={styles.headerLabel}>REQUEST:</Text>
      <Text style={styles.headerAmt}>{props.amt||0}</Text>
      <Text style={styles.headerSat}>sat</Text>
    </View>
    <IconButton
      icon="close"
      color="#DB5554"
      size={22}
      style={{marginRight:32,marginTop:8}}
      onPress={onClose}
    />
  </View>
}

const styles = StyleSheet.create({
  wrapper:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modal:{
    margin:0,
    maxHeight:200,
    height:200,
    position:'absolute',
    width:'100%',
    justifyContent: 'flex-end',
  },
  main:{
    backgroundColor:'white',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    marginTop:5,
    flex:1,
    width:'100%'
  },
  header:{
    height:50,
    minHeight:50,
    width:'100%',
    paddingLeft:0,
    marginLeft:10,
    marginTop:10,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  headerLabel:{
    fontWeight:'bold',
    fontSize:16,
    color:'#6289FD',
    marginRight:8,
  },
  headerAmt:{
    fontWeight:'bold',
    fontSize:20,
    marginRight:8,
  },
  headerSat:{
    fontSize:12,
    color:'#aaa'
  },
  headerLefty:{
    backgroundColor:'white',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    marginLeft:20
  },
  confirmWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    height:100,
    marginTop:25,
    marginBottom:20
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
})
