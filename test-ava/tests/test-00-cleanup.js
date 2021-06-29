var test = require('ava');
var h = require('../utils/helpers')
var r = require('../test-config')
var nodes = require('../nodes.json')
var http = require('ava-http');
var f = require('../utils')

test.beforeEach('cleanup between tests', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, clearAllContacts, nodeArray, false) //always iterate: false
    await h.runTest(t, clearAllChats, nodeArray, false) //always iterate: false
})

async function clearAllContacts(t, index1, index2, index3){
    //DELETE ALL CONTACTS ===>
    
        const nodeArray = [index1, index2, index3]
    
        await h.asyncForEach(nodeArray, async i => {
            
            const node = nodes[i]
            if(!node) return
    
            //get all contacts from node
            var res = await http.get(node.ip+'/contacts?unmet=include', h.makeArgs(node));
            var contacts = res.response.contacts
            t.truthy(contacts, "should have at least one contact")
    
            if(contacts.length === 1) {
                return
            }
    
        
            //delete any contact basides itself
            await h.asyncForEach(contacts, async c => {
                if(c.public_key !== node.pubkey){
                    let deletion = await http.del(node.ip+'/contacts/'+c.id, h.makeArgs(node))
                    t.true(deletion.success, "node should delete the contact")
                }
            })
        
        })
        return true
    
    }

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
                    return
                }
        
            
                //delete any chat that node is a part of
                await h.asyncForEach(chats, async c => {
                    const deletion = await f.deleteChat(t, node, c)
                    t.true(deletion, "node should delete chat")
                })
        
            })
        
            return true
        
        }