import React, {useState, useEffect} from 'react'
// import {StyleSheet} from 'react-native'
import MainNav from './mainnav'
import PINCode, {hasUserSetPinCode} from './utils/pin'
import {useStores} from '../store'
import {Linking} from 'react-native'
import * as utils from './utils/utils'

export default function Main() {
  const {contacts,msg,details,ui} = useStores()
  const [hasPin, setHasPin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(true) // set to false!

  function deeplinkActions(j){
    const action = j['action']
    switch (action) {
      case 'invoice':
        ui.setRawInvoiceModal(j)
      default:
        return
    }
  }

  function gotLink(e){
    if(e && typeof e==='string'){
      const j = utils.jsonFromUrl(e)
      if(j['action']) deeplinkActions(j)
    }
  }

  useEffect(()=>{
    (async () => {
      const pinSet = await hasUserSetPinCode()
      if (pinSet) setHasPin(true)

      await contacts.getContacts()
      await msg.getMessages()
      await details.getBalance()
      // HERE auth with meme server

      Linking.getInitialURL().then(e=> gotLink(e))
      Linking.addEventListener('url', gotLink)
    })()
  },[])

  if (loggedIn) {
    return <MainNav />
  }
  return <PINCode
    // styleMainContainer={styles.main}
    status="enter"
    finishProcess={async() => {
      await sleep(240)
      setLoggedIn(true)
    }}
  />
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}