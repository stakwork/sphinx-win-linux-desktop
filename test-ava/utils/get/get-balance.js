var http = require('ava-http');
var h = require('../helpers')

async function getBalance(t, node){
  //GET BALANCE OF NODE ===>
    
  var r = await http.get(node.ip+'/balance', h.makeArgs(node))
  t.true(r.success, "should get node balance")
  const nodeBalance = r.response.balance
  
      return nodeBalance
}

module.exports = getBalance