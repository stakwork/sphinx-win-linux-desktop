var http = require('ava-http');
var getTribeId = require('../get/get-tribe-id')
var h = require('../helpers')

async function deleteTribe(t, node, tribe){
//NODE DELETES THE TRIBE ===>

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //node deletes the tribe
    let del = await http.del(node.ip+'/chat/'+tribeId, h.makeArgs(node))
    t.true(del.success, "node1 should delete the tribe")

    return true
}

module.exports = deleteTribe