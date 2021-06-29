var http = require('ava-http');
var h = require('../helpers')

async function getLatest(t, node, timestamp){
//GET LATEST FROM A NODE PERSPECTIVE

      //get latest from node perspective
      const res = await http.get(node.ip+`/latest_contacts?date=${timestamp}`, h.makeArgs(node));
      t.true(res.success, "get latest should exist")

      return res
}

module.exports = getLatest