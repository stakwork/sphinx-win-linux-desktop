import * as ipc from './ipc'

export function randString(l) {
  return new Promise(async (resolve, reject) => {
    const ret = await ipc.send('rand', {length:l})
    resolve(ret)
  })
}
