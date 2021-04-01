import React, { useRef, useEffect, useState } from 'react'
import { AppState, ToastAndroid } from 'react-native'
import MainNav from './mainnav'
import { useStores } from '../store'
import { initPicSrc } from './utils/picSrc'
import * as push from './push'
import * as rsa from '../crypto/rsa'
import * as BadgeAndroid from 'react-native-android-badge'
import EE, { RESET_IP, RESET_IP_FINISHED } from './utils/ee'
import {check, VersionDialog} from './checkVersion'

function showToast(msg) {
  ToastAndroid.showWithGravityAndOffset(
    msg,
    ToastAndroid.SHORT,
    ToastAndroid.TOP,
    0,
    125
  );
}

async function createPrivateKeyIfNotExists(contacts, user) {
  const priv = await rsa.getPrivateKey()
  const me = contacts.contacts.find(c=> c.id===user.myid)
  // private key has been made
  if (priv) {
    // set into user.contactKey
    if(me && me.contact_key) {
      if(!user.contactKey) {
        user.setContactKey(me.contact_key)
        // showToast('set user.contactKey')
      }
      // set into me Contact
    } else if(user.contactKey) {
      // contacts.updateContact(user.myid, {
      //   contact_key: user.contactKey
      // })
      // showToast('updated me.contact_key')
    } else {
      // need to regen :(
      const keyPair = await rsa.generateKeyPair()
      user.setContactKey(keyPair.public)
      contacts.updateContact(user.myid, {
        contact_key: keyPair.public
      })
      showToast('generated new keypair!!!')
    }
  // no private key!! 
  } else {
    const keyPair = await rsa.generateKeyPair()
    user.setContactKey(keyPair.public)
    contacts.updateContact(user.myid, {
      contact_key: keyPair.public
    })
    showToast('generated key pair')
  } 
}

let pushToken = ''
push.configure((t) => {
  console.log("PUSH TOKEN:", t && t.token)
  pushToken = t.token
}, (n) => {
  // console.log("ON FINISH",n)
})


export default function Main() {
  
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const { contacts, msg, details, user, meme, ui } = useStores()
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    }
  }, [])

  function handleAppStateChange(nextAppState) {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      loadHistory()
      checkVersion()
    }
    if (appState.current.match(/active/) && nextAppState === "background") {
      const count = msg.countUnseenMessages(user.myid)
      BadgeAndroid.setBadge(count);
    }
    appState.current = nextAppState;
  }

  async function checkVersion() {
    const showDialog = await check()
    if(showDialog) setShowVersionDialog(true)
  }

  async function loadHistory(skipLoadingContacts?:boolean) {
    console.log("============> LOAD HISTORY", user.currentIP)
    ui.setLoadingHistory(true)
    if(!skipLoadingContacts) {
      await contacts.getContacts()
    }
    await msg.getMessages()
    ui.setLoadingHistory(false)
    // msg.initLastSeen()
    await sleep(500)
    details.getBalance()
    await sleep(500)
    meme.authenticateAll()
  }

  useEffect(() => {
    (async () => {

      await contacts.getContacts()

      loadHistory(true)
      checkVersion()

      initPicSrc()

      if (pushToken && !user.deviceId || user.deviceId !== pushToken) {
        user.registerMyDeviceId(pushToken, user.myid)
      }

      createPrivateKeyIfNotExists(contacts, user)
      
    })()

    EE.on(RESET_IP_FINISHED, loadHistory)
    return () => {
      EE.removeListener(RESET_IP_FINISHED, loadHistory)
    }
  }, [])

  function onCloseVersionDialog(){
    setShowVersionDialog(false)
  }

  return <>
    <MainNav />
    <VersionDialog 
      showVersionDialog={showVersionDialog}
      onCloseVersionDialog={onCloseVersionDialog}
    />
  </>
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}