var http = require('ava-http');
var r = require("../../run-ava")

async function getTribeByUuid(t, tribe){
    //GET TRIBE FROM TRIBES SERVER BY UUID

    const res = await http.get("http://"+r.tribeHost+`/tribes/${tribe.uuid}`)
    t.truthy(res, "should get tribe by UUID from tribe host server")

    return res
}

module.exports = getTribeByUuid