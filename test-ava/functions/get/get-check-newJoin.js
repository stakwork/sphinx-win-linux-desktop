var http = require('ava-http');
var h = require('../../helpers/helper-functions')

function getCheckNewJoin(t, admin, joinerId, tribeId){

  // console.log("INNER TRIBE ID === ", tribeId)
  // console.log("JOINER ALIAS === ", joinerId)

    return new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(async() => {
        i++
        const msgRes = await http.get(admin.ip+'/messages', h.makeArgs(admin))
        if(msgRes.response.new_messages && msgRes.response.new_messages.length) {
          const lastMessage = msgRes.response.new_messages.find(msg => 
            (msg.type === 19) && (msg.chat_id === tribeId) && (msg.sender === joinerId))
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

  module.exports = getCheckNewJoin