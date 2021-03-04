var nodes = require('../nodes.json')
var f = require('../functions')
var b = require('../b64-images')

async function boostPayment(t, index1, index2) {
//TWO NODES SEND IMAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 ADDS NODE2 AS A CONTACT
    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    //NODE1 SENDS A BOOST TO NODE2 IN THE CHAT
    const text = h.randomText()
    let messageSent = await f.sendBoost(t, node1, node2, text)
    t.true(messageSent.success, "node1 should send text message to node2")

    //NODE2 SENDS A BOOST TO NODE1 IN THE CHAT
    const text2 = h.randomText()
    let messageSent = await f.sendBoost(t, node1, node2, text2)
    t.true(messageSent.success, "node1 should send text message to node2")

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE1 SENDS A BOOST TO NODE2 IN THE TRIBE

    //NODE2 SENDS A BOOST TO NODE 1 IN THE TRIBE

    //NODE2 LEAVES TRIBE
    let left2 = await f.leaveTribe(t, node2, tribe)
    t.true(left2, "node2 should leave tribe")

    //NODE1 DELETES TRIBE
    let delTribe2 = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe2, "node1 should delete tribe")

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")

}

module.exports = boostPayment