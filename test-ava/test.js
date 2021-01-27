var test = require('ava');
var http = require('ava-http');

var nodes = require('./nodes.json')
var node1 = nodes[0]
var node2 = nodes[1]

function makeArgs(node, body) {
  return {
    headers : {'x-user-token':node.authToken},
    body
  }
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

test('test i am contact #1', async t => {
  const res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  t.true(typeof res === 'object'); // json object by default
  t.true(typeof res.response === 'object')
  t.true(Array.isArray(res.response.contacts))
  var me = res.response.contacts[0]
  t.true(me.public_key === node1.pubkey)


});

test('test add contact', async t => {
  const body = {
    alias: "node2",
    public_key: node2.pubkey,
    status: 1
  }

  //node1 adds node2 as contact
  const r = await http.post(node1.ip+'/contacts', makeArgs(node1, body))
  await sleep(5000)
  console.log("R === ", r)
  const id = r && r.response && r.response.id
  t.true(typeof id === 'number')

  //wait seconds
  //get all contacts
  //find if contact_key of node2 exists (based on id or pubkey)
  //make sure contact_key exists
  
  //node 2 get all contacts
  //find if contact_key of node2 exists (based on id or pubkey)
  //make sure contact_key exists
  //delete node1 contact

  //node1 deletes node2 from contacts
  const r2 = await http.del(node1.ip+`/contacts/`+id, makeArgs(node1))
  console.log(r2)

  t.true(r2.success)

});

// {
//   alias: user.invite.inviterNickname,
//   public_key: user.invite.inviterPubkey,
//   status: constants.contact_statuses.confirmed,
// }

// Add contact
// Wait seconds
// get contacts again
// Check that contact.contact_key exists
// Check it has the contact key
// Delete contact on node 1
// Delete contact on node 2