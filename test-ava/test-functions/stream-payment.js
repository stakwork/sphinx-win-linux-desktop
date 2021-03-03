var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function streamPayment(t, index1, index2, index3) {
//TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = nodes[index3]

    console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

    //NODE1 ADDS NODE2 AS A CONTACT
    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    //NODE1 SENDS A TEXT MESSAGE TO NODE2
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent.success, "node1 should send text message to node2")

    //stream payment from node1 to node2
    var stream1 = await f.payStream(t, node1, node2, null, 14)
    t.true(stream1)

    //stream split payment from node1 to node2 and node3 (50% split)
    var stream2 = await f.payStream(t, node1, node2, node3, 14)
    t.true(stream2)

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")


}

module.exports = streamPayment