var http = require('ava-http');
var r = require("../../test-config")

async function getChallenge(t){
    //GET TRIBE FROM TRIBES SERVER BY UUID
    
    const ask = await http.get("http://"+r.tribeHost+"/ask")
    const challenge = ask.challenge
    t.true(typeof challenge === "string", "should return challenge string")

}

module.exports = getChallenge