var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function contactTest(t, index1, index2) {
//TWO NODES SEND TEXT MESSAGES TO EACH OTHER ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    //NODE1 ADDS NODE2 AS A CONTACT
    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    //NODE1 SENDS A TEXT MESSAGE TO NODE2
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent, "node1 should send text message to node2")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check = await f.checkDecrypt(t, node2, text)
    t.true(check, "node2 should have read and decrypted node1 message")

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text2 = h.randomText()
    let messageSent2 = await f.sendMessage(t, node2, node1, text2)
    t.true(messageSent2, "node2 should send text message to node1")

    //CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check2 = await f.checkDecrypt(t, node1, text2)
    t.true(check2, "node1 should have read and decrypted node2 message")

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")
  
}

module.exports = contactTest