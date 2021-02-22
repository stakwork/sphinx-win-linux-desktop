var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function joinTribe(t, index1, index2) {
//TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE1 SENDS A TEXT MESSAGE IN TRIBE
    const text = h.randomText()
    let tribeMessage = await f.sendTribeMessage(t, node1, tribe, text)
    t.true(tribeMessage.success, "node1 should send message to tribe")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check = await f.checkDecrypt(t, node2, text, tribeMessage.message)
    t.true(check, "node2 should have read and decrypted node1 message")

    //NODE2 SENDS A TEXT MESSAGE IN TRIBE
    const text2 = h.randomText()
    let tribeMessage2 = await f.sendTribeMessage(t, node2, tribe, text2)
    t.true(tribeMessage2.success, "node2 should send message to tribe")

    //CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check2 = await f.checkDecrypt(t, node1, text2, tribeMessage2.message)
    t.true(check2, "node1 should have read and decrypted node2 message")

    //NODE2 LEAVES THE TRIBE
    let left = await f.leaveTribe(t, node2, tribe)
    t.true(left, "node2 should leave tribe")

    //NODE1 DELETES THE TRIBE
    let delTribe = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe, "node1 should delete tribe")

}

module.exports = joinTribe