import { NativeModules } from 'react-native'
const { RNRandomBytes } = NativeModules
// RNRandomBytes.randomBytes(32, (err, bytes) => {
//   // bytes is a base64string
// })

function randString(l): Promise<string> {
  return new Promise((resolve,reject)=>{
    RNRandomBytes.randomBytes(l, (err, bytes) => {
      if(err) reject(err)
      else resolve(bytes)
    })
  })
}

// async function randStringFromBuffer(length) {
//   const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
//   var charsLength = chars.length

//   var randomBytes = await randomBytes(length)
//   var result = new Array(length)

//   var cursor = 0
//   for (var i = 0; i < length; i++) {
//     cursor += randomBytes[i]
//     result[i] = chars[cursor % charsLength]
//   }
//   return result.join('')
// }

export {randString}