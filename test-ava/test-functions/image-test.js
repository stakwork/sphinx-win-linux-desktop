var nodes = require('../nodes.json')
var f = require('../functions')
var b = require('../b64-images')

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
        t.true(imageSent, "image should have been sent")
        
        //NODE2 SENDS AN IMAGE TO NODE1
        const image2 = b.pinkSquare
        const imageSent2 = await f.sendImage(t, node2, node1, image2)
        t.true(imageSent2, "image should have been sent")

            //NODE1 SEND IMAGE TO NODE2
    const price = 11
    const paidImageSent = await f.sendImage(t, node1, node2, image, null, price)
    t.true(paidImageSent, "paid image should have been sent")
    
    //NODE2 SENDS AN IMAGE TO NODE1
    const price2 = 12
    const paidImageSent2 = await f.sendImage(t, node2, node1, image2, null, price2)
    t.true(paidImageSent2, "paid image should have been sent")
        
        //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
        let deletion = await f.deleteContacts(t, node1, node2)
        t.true(deletion, "contacts should be deleted")

}

module.exports = imageTest