var http = require('ava-http');
var h = require('../../helpers/helper-functions')
var getSelf = require('../get/get-self')

async function deleteContacts(t, node1, node2){
//NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
  //get list of contacts from node2 perspective
  let res = await http.get(node2.ip+'/contacts', h.makeArgs(node2));
  //create node1 contact object from node2 perspective
  let node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
  //extract node1 id
  let node1id = node1contact.id

  //node2 find chat containing node2 id and node1 id
  const selfie = await getSelf(t, node2)
  const selfId = selfie.id
  let node2chat = res.response.chats.find(chat => h.arraysEqual(chat.contact_ids, [selfId, parseInt(node1id)]))
  //check that a chat exists with node1 from node2 perspective
  t.truthy(node2chat, 'node2 should have a chat with node1')

      //get list of contacts from node1 perspective
      res = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
      //create node1 contact object from node2 perspective
      let node2contact = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
      //extract node1 id
      let node2id = node2contact.id

  //node2 deletes node1 contact
  const n2deln1 = await http.del(node2.ip+`/contacts/`+node1id, h.makeArgs(node2))
  //check that Node2 deleted Node1
  t.true(n2deln1.success, 'node2 should have deleted node1 contact')

  //get list of contacts from node1 perspective
  res = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
  //node1 deletes node2 from contacts
  const n1deln2 = await http.del(node1.ip+`/contacts/`+node2id, h.makeArgs(node1))
  //check that node1 deleted node2
  t.true(n1deln2.success, "node1 should have deleted node2 contact")

  return true

}

module.exports = deleteContacts