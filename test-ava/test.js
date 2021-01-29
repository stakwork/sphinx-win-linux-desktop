var test = require('ava');
var http = require('ava-http');
var rsa = require('../public/electronjs/rsa')
var nodes = require('./nodes.json')
var node1 = nodes[0]
var node2 = nodes[1]


test('test node1 i am contact #1', async t => {
  //get list of contacts as node1
  const res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  //check that the structure is array within object within object
  t.true(typeof res === 'object'); // json object by default
  t.true(typeof res.response === 'object')
  t.true(Array.isArray(res.response.contacts))
  //create 'me' as first contact in array
  var me = res.response.contacts[0]
  //check that node1 is first contact in node1 contacts
  t.true(me.public_key === node1.pubkey, 'pubkey of first contact should be pubkey of node1')

});


test('test node2 i am contact #1', async t => {
  //get list of contacts as node2
  const res = await http.get(node2.ip+'/contacts', makeArgs(node2));
  //check that the structure is array within object within object
  t.true(typeof res === 'object'); // json object by default
  t.true(typeof res.response === 'object')
  t.true(Array.isArray(res.response.contacts))
  //create 'me' as first contact in array
  var me = res.response.contacts[0]
  //check that node2 is first contact in node2 contacts
  t.true(me.public_key === node2.pubkey, 'pubkey of first contact should be pubkey of node2')

});


test('test add contact, send message, delete contact', async t => {
  
  //object of node1 for adding as contact
  const body1 = {
    alias: "node1",
    public_key: node1.pubkey,
    status: 1
  }

  //object of node2 for adding as contact
  const body2 = {
    alias: "node2",
    public_key: node2.pubkey,
    status: 1
  }

  //node1 adds node2 as contact
  const r = await http.post(node1.ip+'/contacts', makeArgs(node1, body2))
  //create node2 id based on the post response
  const node2id = r && r.response && r.response.id
  //check that node2id is a number and therefore exists (contact was posted)
  t.true(typeof node2id === 'number')

  //await contact_key
  await sleep(3000)
  //node1 get all contacts
  let res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  //find if contact_key of node2 exists (based on pubkey)
  //create node2 contact object from node1 perspective 
  let node2contact = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
  //create node1 contact object from node1 perspective
  let node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
  //make sure node 2 has the contact_key
  t.truthy(node2contact.contact_key)

  //create random string for message test
  const text = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  //encrypt random string with node1 contact_key
  const encryptedText = rsa.encrypt(node1contact.contact_key, text)
  //encrypt random string with node2 contact_key
  const remoteText = rsa.encrypt(node2contact.contact_key, text)

  //create message object with encrypted texts
  const v = {
    contact_id: node2contact.id,
    chat_id: null,
    text: encryptedText,
    remote_text_map: {[node2contact.id]: remoteText},
    amount: 0,
    reply_uuid: "",
    boost: false,
  }

  //send message from node1 to node2
  const msg = await http.post(node1.ip+'/messages', makeArgs(node1, v))
  //make sure msg exists
  t.truthy(msg, "msg should exist")

  //wait for message to process
  await sleep(1000)
  //get list of messages from node2 perspective
  res = await http.get(node2.ip+'/messages', makeArgs(node2))
  //make sure that messages exist
  t.truthy(res.response.new_messages, 'node2 should have at least one message')
  //extract the last message sent to node2
  const lastMessage = res.response.new_messages[res.response.new_messages.length-1]
  //decrypt the last message sent to node2 using node2 privat key and lastMessage content
  const decrypt = rsa.decrypt(node2.privkey, lastMessage.message_content)
  //the decrypted message should equal the random string input before encryption
  t.true(decrypt === text, 'decrypted text should equal pre-encryption text')


  //get list of contacts from node2 perspective
  res = await http.get(node2.ip+'/contacts', makeArgs(node2));
  //create node1 contact object from node2 perspective
  node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
  //extract node1 id
  const node1id = node1contact.id
  //node2 find chat containing node2 id and node1 id
  let node2chat = res.response.chats.find(chat => arraysEqual(chat.contact_ids, [1, parseInt(node1id)]))
  //check that a chat exists with node1 from node2 perspective
  t.truthy(node2chat, 'node2 should have a chat with node1')

  //node2 deletes node1 contact
  const n2deln1 = await http.del(node2.ip+`/contacts/`+node1id, makeArgs(node2))
  //check that Node2 deleted Node1
  t.true(n2deln1.success, 'node2 should have deleted node1 contact')


  //get list of contacts from node1 perspective
  res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  //node1 deletes node2 from contacts
  const n1deln2 = await http.del(node1.ip+`/contacts/`+node2id, makeArgs(node1))
  //check that node1 deleted node2
  t.true(n1deln2.success, "node1 should have deleted node2 contact")

});



function makeArgs(node, body) {
  return {
    headers : {'x-user-token':node.authToken},
    body
  }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}




// BLANK TEST TEMPLATE === test('', async t => { });
//
//
// {
//   alias: user.invite.inviterNickname,
//   public_key: user.invite.inviterPubkey,
//   status: constants.contact_statuses.confirmed,
// }

// FORMATS

// RES
// res {
//   success: true,
//   response: {
//     contacts: [ [Object], [Object], [Object] ],
//     chats: [ [Object], [Object] ],
//     subscriptions: []
//   }
// }

// CONTACT
// {
//   id: 3,
//   public_key: '03a9a8d953fe747d0dd94dd3c567ddc58451101e987e2d2bf7a4d1e10a2c89ff38',
//   node_alias: null,
//   alias: 'Paul',
//   photo_url: null,
//   private_photo: null,
//   is_owner: 0,
//   deleted: 0,
//   auth_token: null,
//   remote_id: null,
//   status: 1,
//   contact_key: '',      CONTACT KEY WILL BE '' IF NO MESSAGE SENT
//   device_id: null,
//   created_at: '2021-01-26T18:12:13.707Z',
//   updated_at: '2021-01-26T18:12:13.707Z',
//   from_group: 1,
//   notification_sound: null,
//   last_active: null,
//   tip_amount: null
// }