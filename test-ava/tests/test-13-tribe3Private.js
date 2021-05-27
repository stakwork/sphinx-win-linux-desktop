var test = require('ava');
var h = require('../utils/helpers')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../utils')

/*
npx ava test-13-tribe3Private.js --verbose --serial --timeout=2m
*/

test('create private tribe, nodes ask to join, reject and accept, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, tribe3Private, nodeArray, r.iterate)
})

async function tribe3Private(t, index1, index2, index3) {
//THREE NODES SEND MESSAGES IN A PRIVATE TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = nodes[index3]
    t.truthy(node3, "this test requires three nodes")

    console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1, 0, 0, 0, true)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE3 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join2 = await f.joinTribe(t, node3, tribe)
    t.true(join2, "node3 should join tribe")

    //NODE1 CHECKS FOR JOIN MESSAGE FROM NODE2
    const tribeId = await f.getTribeId(t, node1, tribe)
    t.truthy(tribeId, "tribeId should exist")
    const [n1p1, n2p1] = await f.getCheckContacts(t, node1, node2)
    t.truthy(n2p1, "node2 contact should exist")
    const checkJoin = await f.getCheckNewJoin(t, node1, n2p1.id, tribeId)
    t.truthy(checkJoin, "join message should have been sent")

    //NODE1 APPROVES NODE2 TO JOIN TRIBE
    const approve = await f.appRejMember(t, node1, n2p1.id, checkJoin.id, "approved")
    t.truthy(approve, "join should be approved")

    //NODE2 SENDS A TEXT MESSAGE IN TRIBE
    const text2 = h.randomText()
    let tribeMessage2 = await f.sendTribeMessage(t, node2, tribe, text2)
    t.true(tribeMessage2.success, "node2 should send message to tribe")

    //NODE1 (ADMIN) SHOULD DECRYPT NODE2'S MESSAGE
    const n1check2 = await f.checkDecrypt(t, node1, text2, tribeMessage2.message)
    t.true(n1check2, "node1 (admin) should have read and decrypted node2 message")

    //NODE3 SHOULD NOT DECRYPT NODE2'S MESSAGE
    const n3check2 = await f.getFailNewMsgs(t, node3, tribeMessage2.message.uuid)
    t.true(n3check2, "message should not exist")

    //NODE1 CHECK FOR JOIN MESSAGE FROM NODE3
    const [x, n3p1] = await f.getCheckContacts(t, node1, node3)
    t.truthy(n3p1, "node2 contact should exist")
    const checkJoin2 = await f.getCheckNewJoin(t, node1, n3p1.id, tribeId)
    t.truthy(checkJoin2, "join message should have been sent")

    //NODE1 REJECTS NODE3 TO JOIN TRIBE
    const reject = await f.appRejMember(t, node1, n3p1.id, checkJoin2.id, "rejected")
    t.truthy(reject, "join should be rejected")

    //NODE1 CHECKS THAT ONLY NODE1 AND NODE2 ARE IN THE TRIBE
    const n1tribe = await f.getCheckTribe(t, node1, tribeId)
    t.truthy(n1tribe, "get tribe from node1 perspective")
    t.true((n1tribe.contact_ids[0] === n1p1.id), "only node1 and node2 should be in tribe")
    t.true(n1tribe.contact_ids[1] === n2p1.id, "only node2 and node1 should be in tribe")
    t.falsy(n1tribe.contact_ids[2], "there should only be two members of tribe")

        //NODE1 SENDS A TEXT MESSAGE IN TRIBE
        const text = h.randomText()
        let tribeMessage = await f.sendTribeMessage(t, node1, tribe, text)
        t.true(tribeMessage.success, "node2 should send message to tribe")
    
        //NODE2 SHOULD DECRYPT NODE1'S MESSAGE
        const n1check = await f.checkDecrypt(t, node2, text, tribeMessage.message)
        t.true(n1check, "node1 (admin) should have read and decrypted node2 message")
    
        //NODE3 SHOULD NOT DECRYPT NODE2'S MESSAGE
        const n3check = await f.getFailNewMsgs(t, node3, tribeMessage.message.uuid)
        t.true(n3check, "message should not exist")

    //NODE3 LEAVES THE TRIBE
    let n3left2 = await f.leaveTribe(t, node3, tribe)
    t.true(n3left2, "node3 should leave tribe")

    //NODE3 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join3 = await f.joinTribe(t, node3, tribe)
    t.true(join3, "node3 should join tribe")

    //NODE1 CHECK FOR JOIN MESSAGE FROM NODE3
    const checkJoin3 = await f.getCheckNewJoin(t, node1, n3p1.id, tribeId)
    t.truthy(checkJoin3, "join message should have been sent")

    //NODE1 ACCEPTS NODE3 TO JOIN TRIBE
    const approve2 = await f.appRejMember(t, node1, n3p1.id, checkJoin3.id, "approved")
    t.truthy(approve2, "join should be approved")

    //NODE2 SENDS A TEXT MESSAGE IN TRIBE
    const text3 = h.randomText()
    let tribeMessage3 = await f.sendTribeMessage(t, node2, tribe, text3)
    t.true(tribeMessage3.success, "node2 should send message to tribe")

    //NODE1 (ADMIN) SHOULD DECRYPT NODE2'S MESSAGE
    const n1check3 = await f.checkDecrypt(t, node1, text3, tribeMessage3.message)
    t.true(n1check3, "node1 (admin) should have read and decrypted node2 message")

    //NODE3 SHOULD DECRYPT NODE2'S MESSAGE
    const n3check3 = await f.checkDecrypt(t, node3, text3, tribeMessage3.message)
    t.true(n3check3, "message should exist")

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

module.exports = tribe3Private