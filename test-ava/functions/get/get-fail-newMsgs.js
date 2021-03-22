var http = require('ava-http');
var h = require('../../helpers/helper-functions')

function getFailNewMsgs(t, node, msgUuid){
    return new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(async() => {
        i++
        const msgRes = await http.get(node.ip+'/messages', h.makeArgs(node))
        if(msgRes.response.new_messages && msgRes.response.new_messages.length) {
          const lastMessage = msgRes.response.new_messages.find(msg => msg.uuid === msgUuid)
          if(lastMessage) {
            clearInterval(interval)
            reject("message exists (but should not)")
          }
        }
        if(i>5){
          clearInterval(interval)
          resolve(true)
        } 
      }, 1000)
    })
  }

  module.exports = getFailNewMsgs