var http = require('ava-http');

async function getToken(t, node){
//A NODE GETS A SERVER TOKEN FOR POSTING TO MEME SERVER

    //get authentication challenge from meme server
    const r = await http.get('https://memes.sphinx.chat/ask')
    t.truthy(r, "r should exist")
    t.truthy(r.challenge, "r.challenge should exist")

    //call relay server with challenge
    const r2 = await http.get(node.ip+`/signer/${r.challenge}`, makeArgs(node))
    t.true(r2.success, "r2 should exist")
    t.truthy(r2.response.sig, "r2.sig should exist")

    //get server token
    const r3 = await http.post('https://memes.sphinx.chat/verify', {
    form: {id: r.id, sig: r2.response.sig, pubkey: node.pubkey}
    })
    t.truthy(r3, "r3 should exist")
    t.truthy(r3.token, "r3.token should exist")

    return r3.token

}

function randomText(){
    const text = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    return text
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
    }
}

function makeArgs(node, body) {
    return {
        headers : {'x-user-token':node.authToken},
        body
    }
    }
    
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
    }
    
async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
}

async function runTest(t, testFunction, nodeArray){
    await asyncForEach(nodeArray, async n1 => {
        await asyncForEach(nodeArray, async n2 => {
            if(n1===n2) return
            await testFunction(t, n1, n2)
        })
    })
}

module.exports = {getToken, randomText, asyncForEach, makeArgs, arraysEqual, sleep, runTest}