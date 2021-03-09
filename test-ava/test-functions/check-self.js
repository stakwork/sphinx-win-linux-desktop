var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function checkSelf(t, index1, index2, index3){
//CHECK THAT NODE EXISTS AND IS ITS OWN FIRST CONTACT ===>

    const nodeArray = [index1, index2, index3]

    await h.asyncForEach(nodeArray, async i => {

        var node = nodes[i]
        if(!node) return
        console.log(`${node.alias}`)

        //get list of contacts as node
        var me = await f.getSelf(t, node)
        //check that the structure object
        t.true(typeof me === 'object'); // json object by default
        //check that first contact public_key === node pubkey
        t.true(me.public_key === node.pubkey, 'pubkey of first contact should be pubkey of node')


    })

    



}

module.exports = checkSelf