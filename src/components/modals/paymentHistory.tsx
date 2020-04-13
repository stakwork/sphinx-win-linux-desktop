import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, StyleSheet,ScrollView,Text} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function PaymentHistory({visible}) {
  const { details,ui } = useStores()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  function close(){
    ui.setPaymentHistory(false)
  }

  useEffect(()=>{
    (async () => {
      if(visible) {
        setLoading(true)
        const ps = await details.getPayments()
        setPayments(ps)
        setLoading(false)
        console.log(payments.length)
      }
    })()
  },[visible])

  return useObserver(() => <ModalWrap onClose={close} visible={visible} noSwipe>
    <View style={styles.wrap}>
      <Header title="Payment History" onClose={close} />
      <ScrollView style={styles.scroller}>
        {loading && <View style={styles.loading}>
          <ActivityIndicator animating={true} color="grey" />  
        </View>}
        {!loading && payments.map((invoice,i)=> <Payment key={i} {...invoice} />)}
      </ScrollView>
    </View>
  </ModalWrap>)
}

function Payment(props){
  const { contacts } = useStores()
  const {amount, type, date, pubkey, payment_hash} = props
  const params = {
    payment: {
      icon:'arrow-top-right',
      color:'#FFA292',
      background:'white'
    },
    invoice:{
      icon:'arrow-bottom-left',
      color:'#94C4FF',
      background:'#F6FBFE'
    }
  }

  let text = '-'
  const contact = contacts.contacts.find(c=>c.public_key===pubkey)
  if(contact) text = contact.alias
  if(!contact && type==='payment') text=pubkey

  const p = params[type]
  return <View style={{...styles.payment,backgroundColor:p.background}}>
    <Icon name={p.icon} color={p.color} size={32} 
      style={{marginLeft:10}}
    />
    <View style={styles.mid}>
      <Icon name="message-text-outline" color="#bbb" size={18} 
        style={{marginLeft:15}}
      />
      <Text style={styles.contact} numberOfLines={1}>{text}</Text>
    </View>
    <View style={styles.amountWrap}>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.sat}>sat</Text>
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  scroller:{
    flexGrow:1,
    width:'100%',
    overflow:'scroll',
    flexDirection:'column',
    borderTopColor:'#E9EAEC',
    borderTopWidth:1,
  },
  payment:{
    width:'100%',
    height:55,
    maxHeight:55,minHeight:55,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderBottomColor:'#E9EAEC',
    borderBottomWidth:1,
  },
  mid:{
    flex:1,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
  },
  loading:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginTop:40
  },
  amountWrap:{
    marginRight:10,
    marginLeft:40,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row',
  },
  amount:{
    marginRight:10,
    fontSize:14,
    fontWeight:'bold'
  },
  sat:{
    marginRight:10,
    color:'#aaa',
    fontSize:12,
  },
  contact:{
    fontSize:12,
    marginLeft:10
  }
})