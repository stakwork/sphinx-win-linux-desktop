var rsa = require('../../public/electronjs/rsa')
var getCheckNewMsgs = require('./get/get-check-newMsgs')

async function checkDecrypt(t, node, text, msg){
//CHECK THAT THE LAST MESSAGE NODE RECEIVED IS EQUAL TO TEXT ===>

    const lastMsg = await getCheckNewMsgs(t, node, msg.uuid)

    //decrypt the last message sent to node using node private key and lastMsg content
    const decrypt = rsa.decrypt(node.privkey, lastMsg.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text1 should equal pre-encryption text2')

    return true
}

module.exports = checkDecrypt