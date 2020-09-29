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

export default function PubKey({visible, pubkey, onClose}) {
  const { ui } = useStores()

  function copy(){
    Clipboard.setString(pubkey)
    ToastAndroid.showWithGravityAndOffset(
      'Public Key Copied!',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
      0, 125
    );
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