var test = require('ava');
var h = require('../utils/helpers')
var r = require('../test-config')
var nodes = require('../nodes.json')
var f = require('../utils')
var http = require('ava-http');
var clearAllContacts = require('./test-98-clearAllContacts')

/*
npx ava test-41-paidMeet.js --verbose --serial --timeout=2m
*/

test('test-41-paidMeet: update price_to_meet, add contact paid/unpaid, reset contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, paidMeet, nodeArray, false)
})

async function paidMeet(t, index1, index2) {
//NODE2 ADDS NODE1 AS A CONTACT WITH AND WITHOUT PRICE_TO_MEET ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 CHANGES PROFILE ALIAS
    const meetPrice = {price_to_meet: 13}
    const change = await f.updateProfile(t, node1, meetPrice)
    t.true(change, "node1 should have changed its price to meet")

    //NODE1 CHECK CONTACT INFO
    const self = await f.getSelf(t, node1)
    t.true(self.price_to_meet === 13, "node1 should have updated price_to_meet")

    //NODE2 ADDS NODE1 AS A CONTACT
    let added = await f.addContact(t, node2, node1)
    t.true(added, "node2 should add node1 as contact")

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node2, node1, text)
    t.true(messageSent.success, "node2 should send text message to node1")

    //GET CONTACTS FROM NODE1, NODE2 WILL NOT BE LISTED
    const contacts = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
    t.falsy(contacts.response.contacts.find(c => c.public_key === node2.pubkey), "node2 will not be listed in contacts")

    //GET CONTACTS FROM NODE1 INCLUDING UNMET, NODE2 WILL BE LISTED
    const contacts2 = await http.get(node1.ip+'/contacts?unmet=include', h.makeArgs(node1));
    // console.log("contacts2 === ", JSON.stringify(contacts2.response.contacts))
    t.truthy(contacts2.response.contacts.find(c => c.public_key === node2.pubkey), "node2 will be listed in unmet contacts")

    //ATTEMPT CONTACT AGAIN

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text2 = h.randomText()
    const amount = 13
    let messageSent2 = await f.sendMessage(t, node2, node1, text2, {amount})
    t.true(messageSent2.success, "node2 should send text message to node1 with correct amount")

    //GET CONTACTS FROM NODE1, NODE2 WILL BE LISTED
    const contacts3 = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
    // console.log("contacts3 === ", JSON.stringify(contacts3.response.contacts))
    t.truthy(contacts3.response.contacts.find(c => c.public_key === node2.pubkey), "node2 will be listed in contacts")

    //DELETE ALL CONTACTS
    const clear = await clearAllContacts(t, index1, index2)
    t.truthy(clear, "all contacts should be cleared")

    //NODE2 ADDS NODE1 AS A CONTACT WITH CORRECT PRICE TO MEET
    let added3 = await f.addContact(t, node2, node1)
    t.true(added3, "node2 should add node1 as contact again")

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text3 = h.randomText()
    const amount2 = 13
    let messageSent3 = await f.sendMessage(t, node2, node1, text3, {amount: amount2})
    t.true(messageSent3.success, "node2 should send text message to node1 with correct amount")

    //GET CONTACTS FROM NODE1, NODE2 WILL BE LISTED
    const contacts5 = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
    // console.log("contacts5 === ", JSON.stringify(contacts5.response.contacts))
    t.truthy(contacts5.response.contacts.find(c => c.public_key === node2.pubkey), "node2 will be listed in contacts")

    //NODE1 RESETS PROFILE
    const meetPrice2 = {price_to_meet: 0}
    const change2 = await f.updateProfile(t, node1, meetPrice2)
    t.true(change2, "node1 should have changed its price to meet")

    //NODE1 CHECK CONTACT INFO
    const self2 = await f.getSelf(t, node1)
    t.true(self2.price_to_meet === 0, "node1 price_to_meet should be reset to 0")

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")

}

module.exports = paidMeet