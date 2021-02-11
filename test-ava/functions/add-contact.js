var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function addContact(t, node1, node2){
    //NODE1 ADDS NODE2 AS A CONTACT

        //object of node2 for adding as contact
        const body = {
          alias: "node2",
          public_key: node2.pubkey,
          status: 1
      }
    
      //node1 adds node2 as contact
      const add = await http.post(node1.ip+'/contacts', h.makeArgs(node1, body))
      //create node2 id based on the post response
      var node2id = add && add.response && add.response.id
      //check that node2id is a number and therefore exists (contact was posted)
      t.true(typeof node2id === 'number')
    
      //await contact_key
      await h.sleep(1000)
      //node1 get all contacts
      let res = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
      //find if contact_key of node2 exists (based on pubkey)
      //create node2 contact object from node1 perspective 
      let n2contactP1 = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
      //create node1 contact object from node1 perspective
      let n1contactP1 = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
      //make sure node 2 has the contact_key
      t.truthy(n2contactP1.contact_key, "node2 should have a contact key")
      t.truthy(n1contactP1, "node1 should be its own first contact")
    
      return true
    
    }

module.exports = addContact