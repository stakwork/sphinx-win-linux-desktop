var http = require('ava-http');
var r = require("../../run-ava")

async function getPoll(t, challenge){
    //GET POLL FROM TRIBES SERVER
    const poll = await http.get("http://"+r.tribeHost+`/poll/${challenge}`)
    console.log("POLL === ", poll)
}

module.exports = getPoll