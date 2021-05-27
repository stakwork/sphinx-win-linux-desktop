var test = require('ava');
var h = require('../helpers/helper-functions')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../functions')

/*
npx ava test-12-tribe3Escrow.js --verbose --serial --timeout=2m
*/

test('create tribe, two nodes join tribe, send messages, check escrow, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, tribe3Escrow, nodeArray, r.iterate)
})

async function tribe3Escrow(t, index1, index2, index3) {
//TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = nodes[index3]
    t.truthy(node3, "this test requires three nodes")

    console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

    //NODE1 CREATES A TRIBE WITH ESCROW AND PPM
    let tribe = await f.createTribe(t, node1, 10, 2000, 5)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE3 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join2 = await f.joinTribe(t, node3, tribe)
    t.true(join2, "node3 should join tribe")

    //NODE2 (non-admin) SENDS A PAID TEXT MESSAGE IN TRIBE
    const text = h.randomText()
    let escrowMessage = await f.sendEscrowMsg(t, node2, node1, tribe, text)
    t.true(escrowMessage.success, "node2 (non-admin) should send escrow message to tribe")

    //CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n3check = await f.checkDecrypt(t, node3, text, escrowMessage.message)
    t.true(n3check, "node3 (non-admin) should have read and decrypted node2's message")

    //NODE2 LEAVES THE TRIBE
    let n2left = await f.leaveTribe(t, node2, tribe)
    t.true(n2left, "node2 should leave tribe")

    //NODE3 LEAVES THE TRIBE
    let n3left = await f.leaveTribe(t, node3, tribe)
    t.true(n3left, "node3 should leave tribe")

    //NODE1 DELETES THE TRIBE
    let delTribe = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe, "node1 should delete tribe")

}

module.exports = tribe3Escrow