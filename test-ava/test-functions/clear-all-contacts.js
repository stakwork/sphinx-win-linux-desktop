var nodes = require('../nodes.json')
var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function clearAllContacts(t, index1, index2, index3){
//DELETE ALL CONTACTS ===>

    const nodeArray = [index1, index2, index3]

    await h.asyncForEach(nodeArray, async i => {
        
        const node = nodes[i]
        if(!node) return

        //get all contacts from node
        var res = await http.get(node.ip+'/contacts', h.makeArgs(node));
        var contacts = res.response.contacts
        t.truthy(contacts, "should have at least one contact")

        if(contacts.length === 1) {
            console.log(`${node.alias} had no contacts`)
            return
        }

    
        //delete any contact basides itself
        await h.asyncForEach(contacts, async c => {
            if(c.public_key !== node.pubkey){
                let deletion = await http.del(node.ip+'/contacts/'+c.id, h.makeArgs(node))
                t.true(deletion.success, "node should delete the contact")
            }
        })

        console.log(`${node.alias} deleted all contacts`)

    })
    return true

}

module.exports = clearAllContacts