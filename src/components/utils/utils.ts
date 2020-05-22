import {decode as atob} from 'base-64'

const base64Fields=['imgurl']

export function jsonFromUrl(url): {[k:string]:any} {
  const qIndex = url.indexOf('?')
  var query = url.substr(qIndex+1)
  var result = {}
  query.split("&").forEach(function (part) {
    var item = part.split("=")
    if(base64Fields.includes(item[0])){
      result[item[0]] = atob(item[1])
    } else {
      result[item[0]] = item[1]
    } 
  })
  return result
}