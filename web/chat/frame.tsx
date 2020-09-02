import React,{useEffect,useState} from 'react'
import {useStores} from '../../src/store'
import BridgeModal from '../modals/bridgeModal'
import {randString} from '../crypto/rand'

const dirname = getDirname()

interface BridgeState {
  budget?:number
  pubkey?:string
}

export default function Frame({url}){
  const [render,setRender] = useState(false)
  const [bridge,setBridge] = useState(null)
  const [password,setPassword] = useState('')
  const [savedPubkey,setSavedPubkey] = useState('')
  const [savedBudget,setSavedBudget] = useState(0)
  const {user,msg,details} = useStores()
  useEffect(()=>{
    setTimeout(()=> setRender(true), 5)
  },[])

  async function webviewSend(args){
    const webview:any = document.getElementById('frame')
    const pass:string = await randString(16)
    if(args.budget || args.budget===0) setSavedBudget(args.budget)
    if(args.pubkey) setSavedPubkey(args.pubkey)
    setPassword(pass)
    webview.send('sphinx-bridge',{
      application: 'Sphinx',
      ...args,
      password:pass
    })
  }

  useEffect(()=>{
    const webview:any = document.getElementById('frame')
    async function handle(e){
      const data = e.args.length&&e.args[0]
      if(data.type==='AUTHORIZE') {
        setBridge({...data,url})
      }
      if(data.type==='KEYSEND') {
        console.log('KEYSEND',data)
        const amt = data.amt
        const dest = data.dest
        if(!amt||!dest) return console.log("missing dest or amt")
        await msg.sendPayment({
          contact_id:null,chat_id:null,
          destination_key:dest,
          amt:amt,
          memo: ``
        })
        webviewSend({
          type: 'KEYSEND',
          success: true,
        })
      }
      if(data.type==='UPDATED') {
        webviewSend({
          type: 'UPDATED',
          success: true,
        })
        details.getBalance()
      }
      if(data.type==='RELOAD') {
        const pass = data.password
        let success = false
        let budget = 0
        let pubkey = ''
        if(pass && pass===password) {
          success = true
          budget = savedBudget || 0
          pubkey = savedPubkey || ''
        }
        webviewSend({
          type: 'RELOAD',
          success, budget, pubkey
        })
      }
    }
    function consoleHandle(e){
      console.log('WEBVIEW:', e.message)
    }
    if(render){
      webview.addEventListener('console-message',consoleHandle)
      webview.addEventListener('ipc-message', handle)
      return ()=> {
        webview.removeEventListener('ipc-message', handle)
        webview.removeEventListener('console-message',consoleHandle)
      }
    }  
  },[render,password,savedBudget,savedPubkey])

  function authorize(amt){
    setBridge(null)
    const webview:any = document.getElementById('frame')
    if(!amt||!user.publicKey) return console.log("missing params")
    webviewSend({
      type: 'AUTHORIZE',
      budget: amt,
      pubkey: user.publicKey
    })
  }

  const sty={height:'100%',flex:1,width:'100%'}
  return <div style={sty}>
    {bridge && <BridgeModal params={bridge} onClose={()=>setBridge(null)} 
      authorize={authorize}
    />}
    {render && <webview //enableremotemodule="false"  
      src={url} style={sty} id="frame"
      preload={`file://${dirname}/preload.js`}>
    </webview>}
  </div>
}

function getDirname(){
  const electron = window.require ? window.require("electron") : {}
  const app:any = electron&&electron.remote&&electron.remote.app
  return (app&&app.dirname)||'.'
}