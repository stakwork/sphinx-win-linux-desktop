var http = require('ava-http');
var h = require('../helpers')

async function getSelf(t, node){
//GET CONTACT FOR NODE FROM NODE PERSPECTIVE ===>
    
    //get list of contacts from node perspective
    const res = await http.get(node.ip+'/contacts', h.makeArgs(node));
    //create node contact object from node perspective
    let nodeContact = res.response.contacts.find(contact => contact.public_key === node.pubkey)
    t.true(typeof nodeContact === "object", "node should be its own first contact")

    return nodeContact
}

module.exports = getSelf