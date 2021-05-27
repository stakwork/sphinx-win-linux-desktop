var http = require('ava-http');
var h = require('../helpers')

function getCheckNewMsgs(t, node, msgUuid){
    return new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(async() => {
        i++
        const msgRes = await http.get(node.ip+'/messages', h.makeArgs(node))
        if(msgRes.response.new_messages && msgRes.response.new_messages.length) {
          const lastMessage = msgRes.response.new_messages.find(msg => msg.uuid === msgUuid)
          if(lastMessage) {
            clearInterval(interval)
            resolve(lastMessage)
          }
        }
        if(i>10){
          clearInterval(interval)
          reject(["failed to getCheckNewMsgs"])
        } 
      }, 1000)
    })
  }

  module.exports = getCheckNewMsgs