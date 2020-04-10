import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, Clipboard, StyleSheet} from 'react-native'
import Modal from "./modalWrap"
import { Button, Snackbar } from 'react-native-paper'
import QRCode from '../utils/qrcode'
import Header from './modalHeader'
import Share from 'react-native-share'

export default function PubKey({visible, pubkey, onClose}) {
  const { ui } = useStores()
  const [copied, setCopied] = useState(false)

  function copy(){
    Clipboard.setString(pubkey)
    setCopied(true)
  }
  async function share(){
    try{
      await Share.open({message:pubkey})
    } catch(e){}
  }

  return useObserver(() =>
    <Modal visible={visible} onClose={onClose}>
      <Header title="Public Key" onClose={onClose} />
      <View style={styles.qrWrap}>
        <QRCode value={pubkey} size={250} />
      </View>
      <Text style={styles.pubkeyText}>{pubkey}</Text>
      <View style={styles.buttonsWrap}>
        <Button mode="contained" dark={true} 
          onPress={()=> share()}
          style={styles.button}>
          Share
        </Button>
        <Button mode="contained" dark={true}
          style={styles.button}
          onPress={()=> copy()}>
          Copy
        </Button>
      </View>
      <Snackbar
        visible={copied}
        onDismiss={()=> setCopied(false)}>
          Public Key Copied!
      </Snackbar>
    </Modal>
  )
}

const styles = StyleSheet.create({
  qrWrap:{
    display:'flex',
    flexDirection:'column',
    padding:20,
    width:'100%',
    alignItems:'center',
    marginTop:50,
  },
  pubkeyText:{
    padding:20,
    width:'100%'
  },
  buttonsWrap:{
    marginTop:40,
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