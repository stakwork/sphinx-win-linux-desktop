import React, { useRef, useReducer } from 'react'
import 'react-native-get-random-values';
import { WebView } from 'react-native-webview'
import { View } from 'react-native'
import { useStores } from '../../../store'
import {randString} from '../../../crypto/rand'
import styles from './components/styles'
import { BridgeModal, LoadingView } from './components'
import { reducer, initialState } from './reducer'

export default function Webview({ url }) {
  const { user, msg, auth } = useStores()
  const [state, dispatch] = useReducer(reducer, initialState)

  const ref = useRef(null)

  async function onMessage(m) {
    const data = m.nativeEvent.data
    try {
      const d = JSON.parse(data)
      console.log("=> WEBVIEW:", d.type, d)
      if (d.type === 'AUTHORIZE') {
        dispatch({ type: 'setBridge', payload: { ...d, url } })
      }
      if (d.type === 'KEYSEND') {
        const amt = d.amt
        const dest = d.dest
        if (!amt || !dest) return console.log("missing dest or amt")
        await msg.sendPayment({
          contact_id: null, chat_id: null,
          destination_key: dest,
          amt: amt,
          memo: '',
        })
        postMessage({
          type: 'KEYSEND',
          success: true,
        })
      }
      if (d.type === 'UPDATED') {
        postMessage({
          type: 'UPDATED',
          success: true,
        })
      }
      if(data.type==='RELOAD') {
        const pass = data.password
        let success = false
        let budget = 0
        let pubkey = ''
        if(pass && pass===state.password) {
          success = true
          budget = parseInt(String(state.savedBudget)) || 0
          pubkey = String(state.savedPubkey) || ''
        }
        postMessage({
          type: 'RELOAD',
          success, budget, pubkey
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function postMessage(args) {
    if (ref && ref.current) {
      const pass:string | any = await randString(16)
      dispatch({ type: 'setPassword', payload: pass })
      if(args.budget || args.budget===0) dispatch({ type: 'setSavedBudget', payload: args.budget })
      if(args.pubkey) dispatch({ type: 'setSavedPubkey', payload: args.pubkey })
      ref.current.postMessage(JSON.stringify({
        ...args,
        application:'Sphinx',
        password:pass
      }))
    }
  }

  async function authorize(amt, challenge: string) {
    let sig = ''
    if (challenge) {
      sig = await auth.sign(challenge)
    }
    postMessage({
      type: 'AUTHORIZE',
      budget: parseInt(amt) || 0,
      pubkey: user.publicKey,
      signature: sig,
    })
    dispatch({ type: 'setBridge', payload: null })
  }

  function onErrorHandler() {
    if (ref && ref.current) {
      ref.current.reload()
    }
  }

  function onCloseBridgeHandler() {
    dispatch({ type: 'setBridge', payload: null })
  }

  return <View style={styles.webview}>
    {state.bridge && state.bridge.url && (
      <BridgeModal
        params={state.bridge}
        onClose={onCloseBridgeHandler}
        authorize={authorize}
        styles={styles}
    />
    )}
    <WebView ref={ref}
      userAgent="Sphinx"
      incognito={true}
      nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
      onMessage={onMessage}
      startInLoadingState={true}
      renderLoading={() => <LoadingView style={styles.loader} />}
      automaticallyAdjustContentInsets={false}
      scalesPageToFit={true}
      contentInset={{ top: 0, right: 0, bottom: 0, left: 0 }}
      source={{ uri: url }}
      javaScriptEnabled={true}
      scrollEnabled={false}
      originWhitelist={['*']}
      onError={onErrorHandler}
    />
  </View>
}