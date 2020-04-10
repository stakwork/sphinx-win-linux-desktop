import React, {useState} from 'react'
import {View,Text,StyleSheet,Clipboard} from 'react-native'
import {Button,Snackbar} from 'react-native-paper'
import QRCode from '../../utils/qrcode'
import Share from 'react-native-share'

export default function ShowRawInvoice({amount,payreq}){
  const [copied, setCopied] = useState(false)
  function copy(){
    Clipboard.setString(payreq)
    setCopied(true)
  }
  async function share(){
    try{
      await Share.open({message:payreq})
    } catch(e){}
  }
  return <View style={styles.innerWrap}>
    {amount && <View style={styles.amtWrap}>
      <Text style={{fontSize:16}}>{`Amount: ${amount} sats`}</Text>
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
  </View>
}

const styles = StyleSheet.create({
  innerWrap:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
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
    marginTop:5,
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