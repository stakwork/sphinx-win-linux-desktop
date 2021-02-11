var nodes = require('../nodes.json')
var f = require('../functions')
var h = require('../helpers/helper-functions')

async function clearAllChats(t, index1){
//DELETE ALL CHATS ===>

    const node = nodes[index1]

    //get all chats from node
    const chats = await f.getChats(t, node)
    if(chats.length === 0) return

    //delete any chat that node is a part of
    await h.asyncForEach(chats, async c => {
        const deletion = await f.deleteChat(t, node, c)
        t.true(deletion, "node should delete chat")
    })

    return true

}

module.exports = clearAllChats