var http = require('ava-http');
var h = require('../helpers')

async function getContacts(t, node1, node2){
//GET CONTACT FOR NODE1 AND NODE2 FROM NODE1 PERSPECTIVE


      //get list of contacts from node1 perspective
      const res = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
      //create node1 contact object from node1 perspective
      let n1contactP1 = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
      t.truthy(n1contactP1)
      //create node1 contact object from node2 perspective
      let n2contactP1 = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
      t.truthy(n2contactP1)

      return [n1contactP1, n2contactP1]


}

module.exports = getContacts