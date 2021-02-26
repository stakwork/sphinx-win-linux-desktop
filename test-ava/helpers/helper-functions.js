var http = require('ava-http');
var r = require('../run-ava')

async function getToken(t, node){
//A NODE GETS A SERVER TOKEN FOR POSTING TO MEME SERVER

    //get authentication challenge from meme server
    const ask = await http.get(`https://${r.memeHost}/ask`)
    t.truthy(ask, "ask should exist")
    t.truthy(ask.challenge, "ask.challenge should exist")

    //call relay server with challenge
    const signer = await http.get(node.ip+`/signer/${r.challenge}`, makeArgs(node))
    t.true(signer.success, "signer should exist")
    t.truthy(signer.response.sig, "signer.sig should exist")

    //get server token
    const verify = await http.post(`https://${r.memeHost}/verify`, {
    form: {id: ask.id, sig: signer.response.sig, pubkey: node.pubkey}
    })
    t.truthy(verify, "verify should exist")
    t.truthy(verify.token, "verify.token should exist")

    return verify.token

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

async function runTest(t, testFunction, nodeArray, iterate){
    if(iterate){
        console.log("ITERATE")
        await asyncForEach(nodeArray, async n1 => {
            if(nodeArray.length === 1){
                await testFunction(t, n1)
            } else {
                if(nodeArray.length === 2){
                    await asyncForEach(nodeArray, async n2 => {
                        if(n1===n2) return
                        await testFunction(t, n1, n2)
                    })
                } else {
                    await asyncForEach(nodeArray, async n2 => {
                        await asyncForEach(nodeArray, async n3 => {
                            var diff = {}
                            diff[n1] = true; diff[n2] = true; diff[n3] = true;
                            if(Object.keys(diff).length !== 3) return
                            await testFunction(t, n1, n2, n3)
                        })
                    })
                }
            }
        })
    } else {
        console.log("NO ITERATE")
        await testFunction(t, nodeArray[0], nodeArray[1], nodeArray[2])
    }
}

module.exports = {getToken, randomText, asyncForEach, makeArgs, arraysEqual, sleep, runTest}