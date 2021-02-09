var test = require('ava');
var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var nodes = require('../nodes.json')
var f = require('../functions')
var node1 = nodes[0]
var node2 = nodes[1]

test('node1 exists', async t => {
    //get list of contacts as node1
    const res = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    //check that the structure is array within object within object
    t.true(typeof res === 'object'); // json object by default
    t.true(typeof res.response === 'object')
    t.true(Array.isArray(res.response.contacts))
    //create 'me' as first contact in array
    var me = res.response.contacts[0]
    //check that node1 is first contact in node1 contacts
    t.true(me.public_key === node1.pubkey, 'pubkey of first contact should be pubkey of node1')
  
  });
  
  
  test('node2 exists', async t => {
    //get list of contacts as node2
    const res = await http.get(node2.ip+'/contacts', f.makeArgs(node2));
    //check that the structure is array within object within object
    t.true(typeof res === 'object'); // json object by default
    t.true(typeof res.response === 'object')
    t.true(Array.isArray(res.response.contacts))
    //create 'me' as first contact in array
    var me = res.response.contacts[0]
    //check that node2 is first contact in node2 contacts
    t.true(me.public_key === node2.pubkey, 'pubkey of first contact should be pubkey of node2')
  
  });