var http = require('ava-http');
var h = require('./helpers')

async function editTribe(t, node, tribeId, body){
//NODE EDIT THE TRIBE ===>
console.log('inside edit')
console.log('body === ', body)
try{
    const res = await http.put(node.ip+`/group/${tribeId}`, h.makeArgs(node, body));
    t.true(res.success, "node should have edited tribe")
}catch(e){console.log("error")}
    
    return {success: res.success, tribe: res.response}
}

module.exports = editTribe