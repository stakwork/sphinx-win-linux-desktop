var http = require('ava-http');
var h = require('./helpers')
var getCheckTribe = require('./get/get-check-tribe')

async function joinTribe(t, node, tribe){
//NODE JOINS TRIBE ===>

    //node joins tribe
    const join = await http.post(node.ip+'/tribe', h.makeArgs(node, tribe))
    //check that join was successful
    t.true(join.success, "node2 should join test tribe")
    const joinedTribeId = join.response.id

    //await arrival of new tribe in chats
    const check = await getCheckTribe(t, node, joinedTribeId)
    t.truthy(check, "joined tribe should be in chats")

    return true
}

module.exports = joinTribe