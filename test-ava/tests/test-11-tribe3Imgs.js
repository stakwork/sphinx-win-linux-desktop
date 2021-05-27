var test = require('ava');
var h = require('../helpers/helper-functions')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../functions')
var b = require('../b64-images')

/*
npx ava test-11-tribe3Imgs.js --verbose --serial --timeout=2m
*/

test('create tribe, two nodes join tribe, send images, 2 nodes leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, tribe3Imgs, nodeArray, r.iterate)
})

async function tribe3Imgs(t, index1, index2, index3) {
//TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = nodes[index3]
    t.truthy(node3, "this test requires three nodes")

    console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE3 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join2 = await f.joinTribe(t, node3, tribe)
    t.true(join2, "node3 should join tribe")

    //NODE1 SEND IMAGE, DECRYPT BY NODE2
    const greenImage = b.greenSquare
    const greenImageSent = await f.sendImage(t, node1, node2, greenImage, tribe)
    t.true(greenImageSent, "message should have been sent")

    //NODE1 SEND IMAGE, DECRYPT BY NODE3
    const greenImage2 = b.greenSquare
    const greenImageSent2 = await f.sendImage(t, node1, node3, greenImage2, tribe)
    t.true(greenImageSent2, "message should have been sent")
    
    //NODE2 SENDS AN IMAGE, DECRYPT BY NODE1
    const pinkImage = b.pinkSquare
    const pinkImageSent = await f.sendImage(t, node2, node1, pinkImage, tribe)
    t.true(pinkImageSent, "message should have been sent")

    //NODE2 SENDS AN IMAGE, DECRYPT BY NODE3
    const pinkImage2 = b.pinkSquare
    const pinkImageSent2 = await f.sendImage(t, node2, node3, pinkImage2, tribe)
    t.true(pinkImageSent2, "message should have been sent")

    //NODE3 SENDS AN IMAGE, DECRYPT BY NODE1
    const blueImage = b.blueSquare
    const blueImageSent = await f.sendImage(t, node3, node1, blueImage, tribe)
    t.true(blueImageSent, "message should have been sent")

    //NODE3 SENDS AN IMAGE, DECRYPT BY NODE2
    const blueImage2 = b.blueSquare
    const blueImageSent2 = await f.sendImage(t, node3, node2, blueImage2, tribe)
    t.true(blueImageSent2, "message should have been sent")

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

module.exports = tribe3Imgs