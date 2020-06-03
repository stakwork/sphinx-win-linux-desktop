import React, {useState} from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import {UiStore} from '../../store/ui'
import {ChatStore} from '../../store/chats'
import {View,StyleSheet} from 'react-native'
import {IconButton, Portal} from 'react-native-paper'
import QR from '../utils/qr'
import * as ln from '../utils/decode'
import * as utils from '../utils/utils'

export default function BottomTabs() {
  const {ui,chats} = useStores()
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
            showPaster
            onCancel={()=>setScanning(false)}
            onScan={async data=>{
              if(isLN(data)) {
                let inv:any
                let theData = data
                if(data.indexOf(':')>=0){ // some are like "lightning:ln....""
                  theData = data.split(':')[1]
                }
                try{inv = ln.decode(theData.toLowerCase())} catch(e){}
                if(!(inv&&inv.human_readable_part))return
                const millisats = inv.human_readable_part.amount
                const sats = millisats && Math.round(millisats/1000)
                ui.setConfirmInvoiceMsg({payment_request:theData,amount:sats})
                setTimeout(()=>{
                  setScanning(false)
                },1500)
              } else if(data.startsWith('sphinx.chat://')) {
                await parseSphinxQR(data, ui, chats)
                setTimeout(()=>{
                  setScanning(false)
                },150)
              }
            }}
          />}
        </View>
      </Portal>
    </View>
  )
}

async function parseSphinxQR(data:string, ui:UiStore, chats:ChatStore){
  const j = utils.jsonFromUrl(data)
  switch(j.action) {
    case 'tribe':
      const tribeParams = await chats.getTribeDetails(j.host,j.uuid)
      // console.log(tribeParams)
      if(tribeParams) ui.setJoinTribeParams(tribeParams)
    default:
      return
  }
}

const lnPrefixes = ['ln','LIGHTNING:ln']
function isLN(s){
  const ok = lnPrefixes.find(p=>s.toLowerCase().startsWith(p.toLowerCase()))
  return ok?true:false
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
