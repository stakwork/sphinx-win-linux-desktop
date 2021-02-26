var http = require('ava-http');
var h = require('../../helpers/helper-functions')

async function getChats(t, node){
  //GET CONTACTS FROM NODE PERSPECTIVE ===>
    
      //get list of contacts from node perspective
      const res = await http.get(node.ip+'/contacts', h.makeArgs(node));
      //create node chats object from node perspective
      let nodeChats = res.response.chats
      t.truthy(nodeChats)
  
      return nodeChats
}

module.exports = getChats