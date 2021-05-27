var test = require('ava');
var h = require('../utils/helpers')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../utils')

/*
npx ava test-99-clearAllChats.js --verbose --serial --timeout=2m
*/

test('clear all chats from nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, clearAllChats, nodeArray, false) //always iterate: false
})

async function clearAllChats(t, index1, index2, index3){
//DELETE ALL CHATS ===>

    const nodeArray = [index1, index2, index3]

    await h.asyncForEach(nodeArray, async i => {
        
        const node = nodes[i]
        if(!node) return


        //get all chats from node
        const chats = await f.getChats(t, node)
        t.truthy(chats, "should have fetched chats")
        if(chats.length === 0) {
            console.log(`${node.alias} had no chats`)
            return
        }

    
        //delete any chat that node is a part of
        await h.asyncForEach(chats, async c => {
            const deletion = await f.deleteChat(t, node, c)
            t.true(deletion, "node should delete chat")
        })

        console.log(`${node.alias} deleted all chats`)
    })

    return true

}

module.exports = clearAllChats