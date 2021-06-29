var rsa = require('../../../public/electronjs/rsa')
var getCheckNewMsgs = require('../get/get-check-newMsgs')

async function botDecrypt(t, node, text, msg){
//CHECK THAT THE MESSAGE SENT BY BOT INCLUDES DESIRED TEXT ===>

    const lastMsg = await getCheckNewMsgs(t, node, msg.uuid)

    //decrypt the last message sent to node using node private key and lastMsg content
    const decrypt = rsa.decrypt(node.privkey, lastMsg.message_content)
    //the decrypted message should equal the random string input before encryption
    // console.log("TEXT === ", text)
    t.true(decrypt.includes(text), 'decrypted bot text should include pre-encryption text')

    return true
}

module.exports = botDecrypt