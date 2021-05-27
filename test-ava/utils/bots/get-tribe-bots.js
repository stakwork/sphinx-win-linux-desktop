var http = require('ava-http');
var h = require('../helpers')
var getTribeId = require('../get/get-tribe-id')

async function getTribeBots(t, node, tribe){
//GET TRIBE BOTS ===>

  const chat_id = await getTribeId(t, node, tribe)
  t.truthy(chat_id, "chat_id should exist")
  console.log("chat_id === ", chat_id)

  let tribeBots = await http.get(node.ip+`/bots/${chat_id}`, h.makeArgs(node))
  console.log("TRIBE BOTS === ", JSON.stringify(tribeBots))
  t.true(tribeBots, "tribe bots should exist")

  return {success: true, bots: tribeBots}
}

module.exports = getTribeBots