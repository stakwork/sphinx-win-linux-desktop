import {setTint} from './components/utils/statusBar'

function tint(){
  setTimeout(()=>setTint('black'),900)
}

export async function deeplinkActions(j, ui, chats){
  const action = j['action']
  switch (action) {
    case 'invoice':
      ui.setRawInvoiceModal(j)
      tint()
    case 'challenge':
      ui.setOauthParams(j)
      tint()
    case 'tribe':
      try{
        const tribeParams = await chats.getTribeDetails(j.host,j.uuid)
        ui.setJoinTribeParams(tribeParams)
        tint()
      }catch(e){}
    default:
      return

  }
}
