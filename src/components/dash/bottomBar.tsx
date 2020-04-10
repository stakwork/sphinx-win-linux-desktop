import React, {useState} from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import {View,StyleSheet,TouchableOpacity} from 'react-native'
import {IconButton, Portal} from 'react-native-paper'
import QR from '../utils/qr'
import * as ln from '../utils/decode'

export default function BottomTabs() {
  const {ui} = useStores()
  const [scanning, setScanning] = useState(false)
  return useObserver(()=>
    <View style={styles.bar}>
      <IconButton icon="arrow-bottom-left" size={32} color="#666"
        onPress={()=> ui.setPayMode('invoice', null)}  // chat here   
      />
      <IconButton icon="format-list-bulleted" size={29} color="#666"
        onPress={()=> ui.setPaymentHistory(true)} 
      />
      <IconButton icon="qrcode-scan" size={25} color="#666"
        onPress={()=> setScanning(true)} // after scan, set {amount,payment_request}
      />
      <IconButton icon="arrow-top-right" size={32} color="#666"
        onPress={()=> ui.setPayMode('payment', null)}  // chat here   
      />

      <Portal>
        <View style={styles.qrWrap}>
          {scanning && <QR 
            onCancel={()=>setScanning(false)}
            onScan={data=>{
              if(data.startsWith('ln')) {
                let inv:any
                try{inv = ln.decode(data)} catch(e){ }
                if(!inv&&inv.human_readable_part)return
                const millisats = inv.human_readable_part.amount
                const sats = millisats && Math.round(millisats/1000)
                ui.setConfirmInvoiceMsg({payment_request:data,amount:sats})
                setTimeout(()=>{
                  setScanning(false)
                },1500)
              }
            }}
          />}
        </View>
      </Portal>
    </View>
  )
}

const styles=StyleSheet.create({
  bar:{
    flex:1,
    width:'100%',
    maxWidth:'100%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-around',
    height:60,
    maxHeight:60,
    minHeight:60,
    backgroundColor:'white',
    elevation:5,
    borderWidth: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  img:{
    width:40,height:40,
    borderRadius:20,
    borderColor:'#ccc',
    borderWidth:1,
    backgroundColor:'whitesmoke',
    marginRight:8,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  qrWrap:{
    flex:1,
    marginTop:24,
  }
})
