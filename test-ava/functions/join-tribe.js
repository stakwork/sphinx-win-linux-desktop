var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function joinTribe(t, node, tribe){
//NODE JOINS TRIBE ===>

    //node joins tribe
    const join = await http.post(node.ip+'/tribe', h.makeArgs(node, tribe))
    //check that join was successful
    t.true(join.success, "node2 should join test tribe")
    //wait for post
    await h.sleep(1000)

    return true
}

module.exports = joinTribe