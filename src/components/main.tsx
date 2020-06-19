import React, {useState, useEffect} from 'react'
// import {StyleSheet} from 'react-native'
import MainNav from './mainnav'
import PINCode, {hasUserSetPinCode} from './utils/pin'
import {useStores} from '../store'
import {initPicSrc} from './utils/picSrc'
import * as push from './push'

export default function Main() {
  const {contacts,msg,details,user,meme,ui} = useStores()
  const [hasPin, setHasPin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(true) // set to false!

  useEffect(()=>{
    (async () => {
      const pinSet = await hasUserSetPinCode()
      if (pinSet) setHasPin(true)

      contacts.getContacts()
      msg.getMessages()
      details.getBalance()
      // HERE auth with meme server

      meme.authenticateAll()

      msg.initLastSeen()

      initPicSrc()

      push.configure((t)=>{
        if(!user.deviceId || user.deviceId!==t.token) {
          user.registerMyDeviceId(t.token)
        }
      })

      ui.initIs24HourFormat()

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