var http = require('ava-http');
var r = require("../../run-ava")

async function getPerson(t, poll){
    //GET Person FROM TRIBES SERVER BY PUBKEY
    const person = await http.get("http://"+r.tribeHost+"/person/"+poll.pubkey)
    console.log("PERSON === ", person)
}

module.exports = getPerson