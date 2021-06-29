var http = require('ava-http');
var h = require('../helpers')

async function botDelete(t, node, botId){
//CREATE A NEW BOT ===>

  let deleteBot = await http.del(node.ip+`/bot/${botId}`, h.makeArgs(node))
  t.true(deleteBot.success, "bot should have been deleted")

  return {success: true, bot: deleteBot.response}
}

module.exports = botDelete