var http = require('ava-http');
var rsa = require('../../../public/electronjs/rsa')
var getSelf = require('../get/get-self')
var getTribeId = require('../get/get-tribe-id')
var getCheckNewMsgs = require('../get/get-check-newMsgs')
var h = require('../helpers')

async function sendTribeMessage(t, node, tribe, text){
//NODE POSTS MESSAGE TO TRIBE ===>

    let nodeContact = await getSelf(t, node)

    //encrypt random string with node contact_key
    const encryptedText = rsa.encrypt(nodeContact.contact_key, text)
    //encrypt random string with test tribe group_key from node1
    const remoteText = rsa.encrypt(tribe.group_key, text)

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //create test tribe message object
    const v = {
      contact_id: null,
      chat_id: tribeId,
      text: encryptedText,
      remote_text_map: {"chat": remoteText},
      amount: 0,
      reply_uuid: "",
      boost: false,
    }

    //send message from node to test tribe
    const msg = await http.post(node.ip+'/messages', h.makeArgs(node, v))
    //make sure msg1 exists
    t.true(msg.success, "node should send message to tribe")
    //wait for message to post
    const msgUuid = msg.response.uuid
    const checkMsg = await getCheckNewMsgs(t, node, msgUuid)
    t.truthy(checkMsg, "await new tribe message post")

    return {success: true, message: msg.response}

}

module.exports = sendTribeMessage