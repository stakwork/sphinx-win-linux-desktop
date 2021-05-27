var http = require('ava-http');
var getTribeId = require('./get/get-tribe-id')
var h = require('./helpers')

async function leaveTribe(t, node, tribe){
//NODE LEAVES THE TRIBE ===>

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //node2 leaves tribe
    const exit = await http.del(node.ip+`/chat/${tribeId}`, h.makeArgs(node))
    //check exit
    t.truthy(exit, "node should exit test tribe")

    return true
}

module.exports = leaveTribe