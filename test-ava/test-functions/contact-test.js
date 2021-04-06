var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function contactTest(t, index1, index2, index3) {
//TWO NODES SEND TEXT MESSAGES TO EACH OTHER ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = null
    if(typeof(index3) === 'number') node3 = nodes[index3]

    var aliases = `${node1.alias} and ${node2.alias}`
    if(node3) aliases = aliases + ` and ${node3.alias}`
    console.log(aliases)

    //NODE1 ADDS NODE2 AS A CONTACT
    let added = await f.addContact(t, node1, node2)
    t.true(added, "node1 should add node2 as contact")

    //NODE1 ADDS NODE3 AS A CONTACT
    if(node3){
        let added2 = await f.addContact(t, node1, node3)
        t.true(added2, "node1 should add node3 as contact")
    }

    //NODE1 SENDS A TEXT MESSAGE TO NODE2
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent.success, "node1 should send text message to node2")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check = await f.checkDecrypt(t, node2, text, messageSent.message)
    t.true(check, "node2 should have read and decrypted node1 message")

    if(node3){

        //NODE1 SENDS A TEXT MESSAGE TO NODE3
        const text2 = h.randomText()
        let messageSent2 = await f.sendMessage(t, node1, node3, text2)
        t.true(messageSent2.success, "node1 should send text message to node3")
    
        //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check2 = await f.checkDecrypt(t, node3, text2, messageSent2.message)
        t.true(check2, "node3 should have read and decrypted node1 message")
    }

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text3 = h.randomText()
    let messageSent3 = await f.sendMessage(t, node2, node1, text3)
    t.true(messageSent3.success, "node2 should send text message to node1")

    //CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const check3 = await f.checkDecrypt(t, node1, text3, messageSent3.message)
    t.true(check3, "node1 should have read and decrypted node2 message")

    if(node3){

        //NODE3 SENDS A TEXT MESSAGE TO NODE1
        const text4 = h.randomText()
        let messageSent4 = await f.sendMessage(t, node3, node1, text4)
        t.true(messageSent4.success, "node3 should send text message to node1")
        
        //CHECK THAT NODE3'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check4 = await f.checkDecrypt(t, node1, text4, messageSent4.message)
        t.true(check4, "node1 should have read and decrypted node3 message")
    }

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "node1 and node2 should delete each other as contacts")

    if(node3){

        //NODE1 AND NODE3 DELETE EACH OTHER AS CONTACTS
        let deletion2 = await f.deleteContacts(t, node1, node3)
        t.true(deletion2, "node1 and node3 should delete each other as contacts")
    }

    //ADDITIONAL CHECK FOR PROXY NODES
    if(node3){
        //NODE2 ADDS NODE1 AS A CONTACT
        let added3 = await f.addContact(t, node2, node1)
        t.true(added3, "node2 should add node1 as contact")

        //NODE1 ADDS NODE3 AS A CONTACT
        let added4 = await f.addContact(t, node3, node1)
        t.true(added4, "node3 should add node1 as contact")

        //NODE2 SENDS A TEXT MESSAGE TO NODE1
        const text5 = h.randomText()
        let messageSent5 = await f.sendMessage(t, node2, node1, text5)
        t.true(messageSent5.success, "node2 should send text message to node1")

        //CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check5 = await f.checkDecrypt(t, node1, text5, messageSent5.message)
        t.true(check5, "node1 should have read and decrypted node1 message")

        //NODE3 SENDS A TEXT MESSAGE TO NODE1
        const text6 = h.randomText()
        let messageSent6 = await f.sendMessage(t, node3, node1, text6)
        t.true(messageSent6.success, "node3 should send text message to node1")

        //CHECK THAT NODE3'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check6 = await f.checkDecrypt(t, node1, text6, messageSent6.message)
        t.true(check6, "node1 should have read and decrypted node1 message")

        //NODE1 SENDS A TEXT MESSAGE TO NODE2
        const text7 = h.randomText()
        let messageSent7 = await f.sendMessage(t, node1, node2, text7)
        t.true(messageSent7.success, "node1 should send text message to node2")

        //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check7 = await f.checkDecrypt(t, node2, text7, messageSent7.message)
        t.true(check7, "node2 should have read and decrypted node1 message")

        //NODE1 SENDS A TEXT MESSAGE TO NODE3
        const text8 = h.randomText()
        let messageSent8 = await f.sendMessage(t, node1, node3, text8)
        t.true(messageSent8.success, "node1 should send text message to node3")

        //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
        const check8 = await f.checkDecrypt(t, node3, text8, messageSent8.message)
        t.true(check8, "node3 should have read and decrypted node1 message")

        //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
        let deletion3 = await f.deleteContacts(t, node1, node2)
        t.true(deletion3, "node1 and node2 should delete each other as contacts")

        //NODE1 AND NODE3 DELETE EACH OTHER AS CONTACTS
        let deletion4 = await f.deleteContacts(t, node1, node3)
        t.true(deletion4, "node1 and node3 should delete each other as contacts")

    }
  
}

module.exports = contactTest