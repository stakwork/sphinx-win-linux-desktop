var http = require('ava-http');
var h = require('../helpers')

async function getNewMsgs(t, node){
//GET NEW MESSAGES FOR NODE FROM NODE PERSPECTIVE ===>
    
    //get list of messages from node perspective
    const res = await http.get(node.ip+'/messages', h.makeArgs(node));
    //check for new messages
    if(res.response.new_messages && res.response.new_messages.length) {
        //return new messages
        const newMessages = res.response.new_messages
        t.truthy(newMessages, "newMessages should exist")
        return newMessages
    }
    //if no new messages, return false
    return false
}

module.exports = getNewMsgs