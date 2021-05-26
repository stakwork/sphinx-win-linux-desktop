var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function editTribe(t, node, tribeId, body){
//NODE EDIT THE TRIBE ===>

    const res = await http.put(node.ip+`/group/${tribeId}`, h.makeArgs(node, body));
    t.true(res.success, "node should have edited tribe")

    return {success: res.success, tribe: res.response}
}

module.exports = editTribe