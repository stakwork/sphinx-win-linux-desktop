var test = require('ava');
var h = require('../utils/helpers')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../utils')
var b = require('../b64-images')

/*
npx ava test-06-paidImages.js --verbose --serial --timeout=2m
*/

test('test-06-paidImages: create tribe, join tribe, send paid images, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, paidImages, nodeArray, r.iterate)
})

async function paidImages(t, index1, index2) {
    //TWO NODES SEND PAID IMAGES TO EACH OTHER ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE1 SEND IMAGE TO NODE2
    const image = b.greenSquare
    const price = 11
    const imageSent = await f.sendImage(t, node1, node2, image, tribe, price)
    t.true(imageSent, "message should have been sent")
    
    //NODE2 SENDS AN IMAGE TO NODE1
    const image2 = b.pinkSquare
    const price2 = 12
    const imageSent2 = await f.sendImage(t, node2, node1, image2, tribe, price2)
    t.true(imageSent2, "message should have been sent")

    //NODE2 LEAVES TRIBE
    let left2 = await f.leaveTribe(t, node2, tribe)
    t.true(left2, "node2 should leave tribe")

    //NODE1 DELETES TRIBE
    let delTribe2 = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe2, "node1 should delete tribe")
      
}

module.exports = paidImages