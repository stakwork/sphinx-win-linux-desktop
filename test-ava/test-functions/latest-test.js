var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function latestTest(t, index1, index2, index3) {
//TWO NODES SEND TEXT MESSAGES TO EACH OTHER ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = null
    if(typeof(index3) === 'number') node3 = nodes[index3]

    var aliases = `${node1.alias} and ${node2.alias}`
    if(node3) aliases = aliases + ` and ${node3.alias}`
    console.log(aliases)

    //CREATE TIMESTAMP
    const dateq1 = h.getTimestamp()
    t.truthy(dateq1, "timestamp should exist")

    await h.sleep(1000)

    //NODE1 GETS LATEST
    let latest = await f.getLatest(t, node1, dateq1)
    t.true(latest.success, "node1 should get latest")
    t.true(latest.response.contacts.length === 0, "there should be no contacts")
    t.true(latest.response.chats.length === 0, "there should be no chats")
    
    //NODE1 ADDS NODE2 AS A CONTACT
    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    //NODE1 GETS LATEST
    let latest2 = await f.getLatest(t, node1, dateq1)
    t.true(latest2.success, "node1 should get latest")
    t.true(latest2.response.contacts.length === 1, "there should be one contacts")
    t.true(latest2.response.contacts[0].public_key === node2.pubkey, "node2 should be the latest contact")

    //NODE1 SENDS A TEXT MESSAGE TO NODE2
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent.success, "node1 should send text message to node2")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check = await f.checkDecrypt(t, node2, text, messageSent.message)
    t.true(check, "node2 should have read and decrypted node1 message")

    await h.sleep(1000)

    //NODE1 GETS LATEST
    let latest3 = await f.getLatest(t, node2, dateq1)
    t.true(latest3.success, "node2 should get latest")
    t.true(latest3.response.contacts.length === 1, "there should be no contacts")
    t.true(latest3.response.chats.length === 1, "there should be no chats")

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")
  
}

module.exports = latestTest