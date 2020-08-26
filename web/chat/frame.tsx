import React,{useEffect,useState} from 'react'
import {useStores} from '../../src/store'
import BridgeModal from '../modals/bridgeModal'

const dirname = getDirname()

export default function Frame({url}){
  const [render,setRender] = useState(false)
  const [bridge,setBridge] = useState(null)
  const {user,msg,details} = useStores()
  useEffect(()=>{
    setTimeout(()=> setRender(true), 5)
  },[])

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
        webview.send('sphinx-bridge',{
          type: 'KEYSEND',
          application: 'Sphinx',
          success: true,
        })
      }
      if(data.type==='UPDATED') {
        webview.send('sphinx-bridge',{
          type: 'UPDATED',
          application: 'Sphinx',
          success: true,
        })
        details.getBalance()
      }
    }
    if(render){
      webview.addEventListener('console-message', (e) => {
        console.log('WEBVIEW:', e.message)
      })
      webview.addEventListener('ipc-message', handle)
      return ()=> webview.removeEventListener('ipc-message', handle)
    }  
  },[render])

  function authorize(amt){
    setBridge(null)
    const webview:any = document.getElementById('frame')
    if(!amt||!user.publicKey) return console.log("missing params")
    webview.send('sphinx-bridge',{
      type: 'AUTHORIZE',
      application: 'Sphinx',
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