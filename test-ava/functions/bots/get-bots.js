var http = require('ava-http');
var h = require('../../helpers/helper-functions')

async function getBots(t, node){
//GET BOTS FROM NODE PERSPECTIVE===>

  let bots = await http.get(node.ip+`/bots`, h.makeArgs(node))
  console.log("BOTS === ", JSON.stringify(bots))
  t.truthy(bots, "bots should exist")

  return {success: true, bots: bots.response.bots}
}

module.exports = getBots