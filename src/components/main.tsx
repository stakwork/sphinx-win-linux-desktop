import React, {useState, useEffect} from 'react'
// import {StyleSheet} from 'react-native'
import MainNav from './mainnav'
import {useStores} from '../store'
import {initPicSrc} from './utils/picSrc'
import * as push from './push'
import { is24HourFormat } from 'react-native-device-time-format'
import * as rsa from '../crypto/rsa'

async function createPrivateKey(contacts){
  const priv = await rsa.getPrivateKey()
  if(priv) return // all good

  const keyPair = await rsa.generateKeyPair()
  contacts.updateContact(1, {
    contact_key: keyPair.public
  })
}

export default function Main() {
  const {contacts,msg,details,user,meme,ui} = useStores()
  useEffect(()=>{
    (async () => {
      contacts.getContacts().then(()=>{
        meme.authenticateAll()
      })
      details.getBalance()
      msg.getMessages()
      msg.initLastSeen()

      initPicSrc()

      push.configure((t)=>{
        console.log(t&&t.token)
        if(!user.deviceId || user.deviceId!==t.token) {
          user.registerMyDeviceId(t.token)
        }
      })

      const is24Hour = await is24HourFormat()
      ui.setIs24HourFormat(is24Hour)

      createPrivateKey(contacts)
    })()
  },[])

  return <MainNav />
}
