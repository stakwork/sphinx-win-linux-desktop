var http = require('ava-http');
var r = require("../../run-ava")

async function  postVerify(t, challenge, token, info){
    //GET TRIBE FROM TRIBES SERVER BY UUID

    const tribesVerify = await http.post("http://"+r.tribeHost+`/verify/${challenge}?token=${token}`, {body: info})
    console.log("tribesVerify === ", tribesVerify)
    t.truthy(tribesVerify, "tribe should verify")

    await h.sleep(1000)

}

module.exports = postVerify