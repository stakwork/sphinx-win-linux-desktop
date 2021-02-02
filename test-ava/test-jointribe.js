var test = require('ava');
var http = require('ava-http');
var rsa = require('../public/electronjs/rsa')
var nodes = require('./nodes.json')
var f = require('./functions')
var node1 = nodes[0]
var node2 = nodes[1]

test('join tribe, send message, exit tribe', async t => {

    const name = "Node1 Test Tribe"
    const description = "A tribe for testing"
    //new tribe object
    const newTribe = {
        name, description, tags: [],
        is_tribe: true,
        price_per_message: 0,
        price_to_join: 0,
        escrow_amount: 0,
        escrow_millis: 0,
        img: '',
        unlisted: true,
        private: false,
        app_url: '',
        feed_url: ''
      }

    //node1 creates new tribe
    let c = await http.post(node1.ip+'/group', f.makeArgs(node1, newTribe))
    //check that new tribe was created successfully
    t.true(c.success, "create tribe should be successful")

    //save id of test tribe
    const newTribeId = c.response.id
    //save group_key of test tribe
    const groupKey = c.response.group_key

    //node1 gets list of contacts and chats
    let res = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    //find the new tribe by id
    let r = res.response.chats.find(chat => chat.id === newTribeId)
    //check that the chat was found
    t.truthy(r, "the newly created chat should be found")

    //create tribe object
    const j = {
        name: r.name,
        uuid: r.uuid,
        group_key: r.group_key,
        amount: 0,
        host: r.host,
        img: r.img,
        owner_alias: r.owner_alias,
        owner_pubkey: r.owner_pubkey,
        private: r.private,
        my_alias: "Node2",
        my_photo_url: ""
    }

    //node2 joins test tribe j
    const join = await http.post(node2.ip+'/tribe', f.makeArgs(node2, j))
    //check that join was successful
    t.true(join.success, "node2 should join test tribe j")

    //get list of contacts as node1
    let con = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    // create node1 contact object
    var node1contact = con.response.contacts[0]

    //create node2 contact object from node1 perspective 
    let node2check = con.response.contacts.find(contact => contact.public_key === node2.pubkey)
    //node1 check that tribe has node1 and node2 ids in contact_ids
    let contactJoinCheck = con.response.chats.find(chat => f.arraysEqual(chat.contact_ids, [1, parseInt(node2check.id)]))
    t.truthy(contactJoinCheck, "tribe should have contact ids for node1 and node2")


    //get list of contacts as node2
    con = await http.get(node2.ip+'/contacts', f.makeArgs(node2));
    // create node2 contact object
    var node2contact = con.response.contacts[0]
    //get test tribe id as node2
    const oldTribe = con.response.chats.find(chat=> chat.uuid === c.response.uuid)
    var oldTribeId = oldTribe.id

    //node1 create random string for message test
    const text1 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    //node2 create random string for message test
    const text2 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    //encrypt random string with node1 contact_key
    const encryptedText1 = rsa.encrypt(node1contact.contact_key, text1)
    //encrypt random string with node2 contact_key
    const encryptedText2 = rsa.encrypt(node2contact.contact_key, text2)
    //encrypt random string with test tribe group_key from node1
    const remoteText1 = rsa.encrypt(groupKey, text1)
    //encrypt random string with test tribe group_key from node2
    const remoteText2 = rsa.encrypt(groupKey, text2)

    //create test tribe message object from node1
    const v1 = {
        contact_id: null,
        chat_id: newTribeId,
        text: encryptedText1,
        remote_text_map: {"chat": remoteText1},
        amount: 0,
        reply_uuid: "",
        boost: false,
      }

    //create test tribe message object from node2
    const v2 = {
        contact_id: null,
        chat_id: oldTribeId,
        text: encryptedText2,
        remote_text_map: {"chat": remoteText2},
        amount: 0,
        reply_uuid: "",
        boost: false,
      }

    //send message from node1 to test tribe
    const msg1 = await http.post(node1.ip+'/messages', f.makeArgs(node1, v1))
    //make sure msg1 exists
    t.truthy(msg1, "msg1 should exist")

    //send message from node2 to test tribe
    const msg2 = await http.post(node2.ip+'/messages', f.makeArgs(node2, v2))
    //make sure msg2 exists
    t.truthy(msg2, "msg2 should exist")

    //wait for message to process
    await f.sleep(1000)

    //node2 leaves tribe
    const exit = await http.del(node2.ip+`/chat/${oldTribeId}`, f.makeArgs(node2))
    //check exit
    t.truthy(exit, "node2 should exit test tribe")

    //wait for node2 to leave tribe
    await f.sleep(1000)

    //get test tribe info after node2 has left
    let leave = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    //node1 check that tribe has only node1 contact id
    const contactLeaveCheck = leave.response.chats.find(chat => f.arraysEqual(chat.contact_ids, [ 1 ]))
    //check that node2 has left the tribe
    t.truthy(contactLeaveCheck, "test tribe should only contain node1 id")

    //node1 deletes the tribe
    let d1 = await http.del(node1.ip+'/chat/'+newTribeId, f.makeArgs(node1))
    t.true(d1.success, "node1 should delete the tribe")

    //node2 deletes the tribe
    let d2 = await http.del(node2.ip+'/chat/'+oldTribeId, f.makeArgs(node2))
    t.true(d2.success, "node2 should delete the tribe")

})