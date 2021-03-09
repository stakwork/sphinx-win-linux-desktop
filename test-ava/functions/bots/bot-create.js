var http = require('ava-http');
var h = require('../../helpers/helper-functions')

async function botCreate(t, node, name, webhook){
//CREATE A NEW BOT ===>

  let newBot = await http.post(node.ip+'/bot', h.makeArgs(node, {name, webhook}))
  t.true(newBot.success, "new bot should have been created")

  return {success: true, bot: newBot.response}
}

module.exports = botCreate