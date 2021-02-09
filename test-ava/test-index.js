var nodes = require('./nodes.json')
var f = require('./functions')
var b = require('./b64-images')

async function checkSelf(t, index1){
//CHECK THAT NODE EXISTS AND IS ITS OWN FIRST CONTACT ===>

    const node = nodes[index1]

    //get list of contacts as node
    const me = await f.getSelf(t, node)
    //check that the structure object
    t.true(typeof me === 'object'); // json object by default
    //check that first contact public_key === node pubkey
    t.true(me.public_key === node.pubkey, 'pubkey of first contact should be pubkey of node')

}

async function contactTest(t, index1, index2) {
//TWO NODES SEND TEXT MESSAGES TO EACH OTHER ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    const text = f.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent, "node1 should send text message to node2")

    const text2 = f.randomText()
    let messageSent2 = await f.sendMessage(t, node2, node1, text2)
    t.true(messageSent2, "node2 should send text message to node1")

    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")
  
}

async function imageTest(t, index1, index2) {
//TWO NODES SEND EACH OTHER IMAGES ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

        //NODE1 ADDS NODE2 AS A CONTACT
        const added = await f.addContact(t, node1, node2)
        t.true(added, "n1 should add n2 as contact")

        //NODE1 SEND IMAGE TO NODE2
        const image = b.greenSquare
        const imageSent = await f.sendImage(t, node1, node2, image)
        t.true(imageSent, "message should have been sent")
        
        //NODE2 SENDS AN IMAGE TO NODE1
        const image2 = b.pinkSquare
        const imageSent2 = await f.sendImage(t, node2, node1, image2)
        t.true(imageSent2, "message should have been sent")
        
        //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
        let deletion = await f.deleteContacts(t, node1, node2)
        t.true(deletion, "contacts should be deleted")

}

async function joinTribe(t, index1, index2) {
//TWO NODES SEND TEXT MESSAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    const text = f.randomText()
    let tribeMessage = await f.sendTribeMessage(t, node1, tribe, text)
    t.true(tribeMessage, "node1 should send message to tribe")

    const check = await f.checkDecrypt(t, node2, text)
    t.true(check, "node2 should have read and decrypted node1 message")

    const text2 = f.randomText()
    let tribeMessage2 = await f.sendTribeMessage(t, node2, tribe, text2)
    t.true(tribeMessage2, "node2 should send message to tribe")

    const check2 = await f.checkDecrypt(t, node1, text2)
    t.true(check2, "node1 should have read and decrypted node2 message")

    let left = await f.leaveTribe(t, node2, tribe)
    t.true(left, "node2 should leave tribe")

    let delTribe = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe, "node1 should delete tribe")

}

async function tribeImages(t, index1, index2) {
//TWO NODES SEND IMAGES WITHIN A TRIBE ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE1 SEND IMAGE TO NODE2
    const image = b.greenSquare
    const imageSent = await f.sendImage(t, node1, node2, image, tribe)
    t.true(imageSent, "message should have been sent")
    
    //NODE2 SENDS AN IMAGE TO NODE1
    const image2 = b.pinkSquare
    const imageSent2 = await f.sendImage(t, node2, node1, image2, tribe)
    t.true(imageSent2, "message should have been sent")

    let left2 = await f.leaveTribe(t, node2, tribe)
    t.true(left2, "node2 should leave tribe")

    let delTribe2 = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe2, "node1 should delete tribe")

}



module.exports = {checkSelf, imageTest, contactTest, joinTribe, tribeImages}