var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var h = require('../helpers/helper-functions')
var getCheckContacts = require('./get-check-contacts')

async function sendMessage(t, node1, node2, text, msgPrice){
//NODE1 SENDS TEXT MESSAGE TO NODE2
  const [node1contact, node2contact] = await getCheckContacts(t, node1, node2)

    //encrypt random string with node1 contact_key
    const encryptedText = rsa.encrypt(node1contact.contact_key, text)
    //encrypt random string with node2 contact_key
    const remoteText = rsa.encrypt(node2contact.contact_key, text)
    //create message object with encrypted texts
    const v = {
        contact_id: node2contact.id,
        chat_id: null,
        text: encryptedText,
        remote_text_map: {[node2contact.id]: remoteText},
        amount: 0,
        reply_uuid: "",
        boost: false,
    }

    // if(msgPrice) {
    //     v.message_price = msgPrice,
    //     v.id = -1,
    //     v.sender = 1, 
    //     v.amount = 0,
    //     v.date = "2021-01-01T19:30:00.000Z",
    //     v.type = 0,
    //     v.message_content = text
    // }

    //send message from node1 to node2
    const msg = await http.post(node1.ip+'/messages', h.makeArgs(node1, v))
    //make sure msg exists
    t.truthy(msg, "msg should exist")
    //wait for message to process
    await h.sleep(3000)
    //get list of messages from node2 perspective
    const msgRes = await http.get(node2.ip+'/messages', h.makeArgs(node2))
    //make sure that messages exist
    t.truthy(msgRes.response.new_messages, 'node2 should have at least one message')
    //extract the last message sent to node2
    const lastMessage = msgRes.response.new_messages[msgRes.response.new_messages.length-1]
    //decrypt the last message sent to node2 using node2 private key and lastMessage content
    const decrypt = rsa.decrypt(node2.privkey, lastMessage.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text should equal pre-encryption text')

    return true

}





module.exports = sendMessage