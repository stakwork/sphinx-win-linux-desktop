import * as ln from './decode'

const lnPrefixes = ['ln','LIGHTNING:ln']
export function isLN(s){
  const ok = lnPrefixes.find(p=>s.toLowerCase().startsWith(p.toLowerCase()))
  return ok?true:false
}

export function removeLightningPrefix(data){
    let theData = data
    if(data.indexOf(':')>=0){ // some are like "lightning:ln....""
        theData = data.split(':')[1]
    }
    return theData
}

export function parseLightningInvoice(data){
    let inv:any
    const theData = removeLightningPrefix(data)
    try{
        inv = ln.decode(theData.toLowerCase())
    } catch(e){}
    return inv
}