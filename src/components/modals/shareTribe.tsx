import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, ToastAndroid} from 'react-native'
import Modal from "./modalWrap"
import { Button } from 'react-native-paper'
import QRCode from '../utils/qrcode'
import Header from './modalHeader'
import Share from 'react-native-share'
import Clipboard from "@react-native-community/clipboard";

export default function ShareTribe({visible}) {
  const { ui, chats } = useStores()

  function copy(){
    Clipboard.setString(uuid)
    ToastAndroid.showWithGravityAndOffset(
      'Tribe QR Copied!',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
      0, 125
    );
  }
  async function share(){
    try{
      await Share.open({message:uuid})
    } catch(e){}
  }

  function close(){
    ui.setShareTribeUUID(null)
  }

  const uuid = ui.shareTribeUUID
  const host = chats.getDefaultTribeServer().host
  const qr = `sphinx.chat://?action=tribe&uuid=${uuid}&host=${host}`
  return useObserver(() =>
    <Modal visible={visible} onClose={close}>
      <Header title="Join Group QR Code" onClose={close} />
      <View style={styles.qrWrap}>
        <QRCode value={qr} size={250} />
      </View>
      <Text style={styles.pubkeyText}>{qr}</Text>
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