var http = require('ava-http');
var rsa = require('../../../public/electronjs/rsa')
var h = require('../../helpers/helper-functions')
var getCheckContacts = require('../get/get-check-contacts')
var getCheckNewMsgs = require('../get/get-check-newMsgs')

async function sendMessage(t, node1, node2, text, options){
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
        amount: options && options.amount || 0,
        reply_uuid: "",
        boost: false,
    }

    // if(msgPrice) {
    //     v.message_price = options && options.msgPrice,
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
    t.true(msg.success, "msg should exist")
    const msgUuid = msg.response.uuid
    // //wait for message to process
    const lastMessage = await getCheckNewMsgs(t, node2, msgUuid)
    t.truthy(lastMessage, "await message post")
    //decrypt the last message sent to node2 using node2 private key and lastMessage content
    const decrypt = rsa.decrypt(node2.privkey, lastMessage.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text should equal pre-encryption text')

    return {success: true, message: msg.response}

}





module.exports = sendMessage