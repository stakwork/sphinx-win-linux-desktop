var http = require('ava-http');
var h = require('../../helpers/helper-functions')

function getCheckBotMsg(t, node, botAlias){
    return new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(async() => {
        i++
        const msgRes = await http.get(node.ip+'/messages', h.makeArgs(node))
        if(msgRes.response.new_messages && msgRes.response.new_messages.length) {
          if(msgRes.response.new_messages[msgRes.response.new_messages.length-1].sender_alias === botAlias){
            const lastMessage = msgRes.response.new_messages[msgRes.response.new_messages.length-1]
            if(lastMessage) {
              clearInterval(interval)
              resolve(lastMessage)
            }
          }
        }
        if(i>10){
          clearInterval(interval)
          reject(["failed to getCheckNewMsgs"])
        } 
      }, 1000)
    })
  }

  module.exports = getCheckBotMsg