global.Buffer = global.Buffer || require('buffer').Buffer

const termKeys = [{
  key:'host',
  func: buf=> buf.toString('ascii')
},{
  key:'muid',
  func: buf=> urlBase64(buf)
},{
  key:'pubkey',
  func: buf=> buf.toString('hex')
},{
  key:'ts',
  func: buf=> parseInt('0x' + buf.toString('hex'))
},{
  key:'meta',
  func: buf=> {
    const ascii = buf.toString('ascii')
    return ascii?deserializeMeta(ascii):{} // parse this
  }
},{
  key:'sig',
  func: buf=> urlBase64(buf)
}]

export function parseLDAT(ldat){
  const a = ldat.split('.')
  const o: {[k:string]:any} = {}
  termKeys.forEach((t,i)=>{
    if(a[i]) o[t.key] = t.func(Buffer.from(a[i], 'base64'))
  })
  return o
}

function deserializeMeta(str){
  const json = str && str.length>2 ? JSON.parse('{"' + str.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) }) : {}
  const ret = {}
  for (let [k, v] of Object.entries(json)) {
      const value = (typeof v==='string' && parseInt(v)) || v
      ret[k] = value
  }
  return ret
}

function urlBase64(buf){
  return buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
}
function urlBase64FromBytes(buf){
  return Buffer.from(buf).toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
}
function urlBase64FromAscii(ascii){
  return Buffer.from(ascii,'ascii').toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
}
