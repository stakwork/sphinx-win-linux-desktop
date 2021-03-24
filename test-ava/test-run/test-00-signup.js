var test = require('ava');
var fetch = require('node-fetch')
const Crypto = require('crypto')
var fs = require('fs')

const path = '../_nodes.json'
const pathToWrite = './_nodes.json'
var nodes = require(path)

/*
npx ava test-00-signup.js --verbose --serial --timeout=2m
*/

test.skip('check node signup', async t => {
    if(!nodes) return
    await asyncForEach(nodes, async n=> {
        await signup(t, n)
    })
    t.true(true)
})

async function signup(t, n){
    console.log(n)
    const token = Crypto.randomBytes(20).toString('base64').slice(0, 20)
    const r = await fetch(n.ip+'/contacts/tokens', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            token, pubkey: n.pubkey,
        })
    })
    const json = await r.json()
    t.truthy(json.success)
    t.truthy(json.response && json.response.id) // new user id

    addFieldToNodeJson(n.pubkey, 'authToken', token)
    t.true(true)
}

async function addFieldToNodeJson(pubkey, key, value){
    var nodes = require(path)
    const idx = nodes.findIndex(n=> n.pubkey===pubkey)
    if(idx>-1) {
        nodes[idx][key] = value
    }
    const jsonString = JSON.stringify(nodes, null, 2)
    fs.writeFileSync(pathToWrite, jsonString)
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}