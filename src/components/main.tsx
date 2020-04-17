import React, {useState, useEffect} from 'react'
// import {StyleSheet} from 'react-native'
import MainNav from './mainnav'
import PINCode, {hasUserSetPinCode} from './utils/pin'
import {useStores} from '../store'
import {initPicSrc} from './utils/picSrc'

export default function Main() {
  const {contacts,msg,details,ui,meme} = useStores()
  const [hasPin, setHasPin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(true) // set to false!

  useEffect(()=>{
    (async () => {
      const pinSet = await hasUserSetPinCode()
      if (pinSet) setHasPin(true)

      await contacts.getContacts()
      await msg.getAllMessages()
      await details.getBalance()
      // HERE auth with meme server

      await sleep(500)
      await meme.authenticateAll()

      msg.initLastSeen()

      initPicSrc()

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