var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function deleteChat(t, node, chat){
//NODE DELETES A CHAT GIVEN CHAT OBJECT ===>

  let deletion = await http.del(node.ip+'/chat/'+chat.id, h.makeArgs(node))
  t.true(deletion.success, "node should delete the chat")

  return true
}

module.exports = deleteChat