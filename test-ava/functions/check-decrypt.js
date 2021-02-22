var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var h = require('../helpers/helper-functions')
var getCheckNewMsgs = require('./get-check-newMsgs')

async function checkDecrypt(t, node, text, msg){
//CHECK THAT THE LAST MESSAGE NODE RECEIVED IS EQUAL TO TEXT ===>

    // //get list of messages from node perspective
    // const msg = await http.get(node.ip+'/messages', h.makeArgs(node))
    // //make sure that messages 1 exist
    // t.truthy(msg.response.new_messages, 'node should have at least one message')
    // //extract the last message sent to node
    // const lastMsg = msg.response.new_messages[msg.response.new_messages.length-1]

    const lastMsg = await getCheckNewMsgs(t, node, msg.uuid)

    //decrypt the last message sent to node using node private key and lastMsg content
    const decrypt = rsa.decrypt(node.privkey, lastMsg.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text1 should equal pre-encryption text2')

    return true
}

module.exports = checkDecrypt