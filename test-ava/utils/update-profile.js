var http = require('ava-http');
var h = require('./helpers')
var getSelf = require('./get/get-self')

async function updateProfile(t, node, profileUpdate){
    //NODE UPDATES ITS PROFILE

    const self = await getSelf(t, node)
    t.truthy(self, "own contact should be fetched")
    const nodeId = self.id
    t.truthy(nodeId, "node should have found id for itself")

    const add = await http.put(node.ip+`/contacts/${nodeId}`, h.makeArgs(node, profileUpdate))
    t.truthy(add, "node should have updated its profile")
    
      return true
    
    }

module.exports = updateProfile