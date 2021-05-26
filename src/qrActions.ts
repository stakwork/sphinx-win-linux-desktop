import {setTint} from './components/utils/statusBar'

function tint(){
  setTimeout(()=>setTint('black'),900)
}

export async function qrActions(j, ui, chats){
  const action = j['action']
  switch (action) {
    case 'invoice':
      ui.setRawInvoiceModal(j)
    case 'challenge':
      ui.setOauthParams(j)
    case 'donation':
      ui.setSubModalParams(j)
    case 'redeem_sats':
      ui.setRedeemModalParams(j)
    case 'tribe':
      try{
        const tribeParams = await chats.getTribeDetails(j.host,j.uuid)
        ui.setJoinTribeParams(tribeParams)
      }catch(e){}
      case "auth":
        if (j.challenge && j.host) {
          ui.setTribesAuthParams(j)
        }
      case "person":
        if (j.host && j.pubkey) {
          try {
            const r = await fetch('https://'+j.host+'/person/'+j.pubkey)
            const jj = await r.json()
            if(jj) ui.setPersonParams(jj)
          } catch(e) {
            console.log(e)
          }
        }
    default:
      console.log(action)
    // set the tint
    tint()
  }
}
