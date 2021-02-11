var nodes = require('../nodes.json')
var f = require('../functions')

async function checkSelf(t, index1){
//CHECK THAT NODE EXISTS AND IS ITS OWN FIRST CONTACT ===>

    const node = nodes[index1]

    //get list of contacts as node
    const me = await f.getSelf(t, node)
    //check that the structure object
    t.true(typeof me === 'object'); // json object by default
    //check that first contact public_key === node pubkey
    t.true(me.public_key === node.pubkey, 'pubkey of first contact should be pubkey of node')

}

module.exports = checkSelf