import {decode as atob} from 'base-64'

const base64Fields=['imgurl']

export function jsonFromUrl(url): {[k:string]:any} {
  const qIndex = url.indexOf('?')
  var query = url.substr(qIndex+1)
  var result = {}
  query.split("&").forEach(function(s) {
    const idx = s.indexOf('=')
    const k = s.substr(0,idx)
    const v = s.substr(idx+1)
    if(base64Fields.includes(k)){
      result[k]=atob(v)
    } else {
      result[k]=v
    }
  })
  return result
}