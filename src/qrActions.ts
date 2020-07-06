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
    case 'tribe':
      try{
        const tribeParams = await chats.getTribeDetails(j.host,j.uuid)
        ui.setJoinTribeParams(tribeParams)
      }catch(e){}
    default:
      console.log(action)
    // set the tint
    tint()
  }
}
