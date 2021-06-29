var test = require('ava');
var fetch = require('node-fetch')
const Crypto = require('crypto')
var fs = require('fs')
var rsa = require('../../public/electronjs/rsa')

const path = '../_nodes.json'
const pathToWrite = './_nodes.json'

const CLEAR = false

/*
npx ava test-00-signup.js --verbose --serial --timeout=2m
*/

test('test-00-signup: check node signup', async t => {
    var nodes1 = require(path)
    await asyncForEach(nodes1, async n=> {
        const token = await signup(t, n)
        t.truthy(token)
        n.authToken = token
        await createContactKey(t, n)
    })

    if (!CLEAR) return
    var nodesAgain = require(path)
    await asyncForEach(nodesAgain, async n=> {
        await clearNode(t, n)
    })
})

function headers(token) {
    const h = {'Content-Type': 'application/json'}
    if(token) h['x-user-token'] = token
    return h
}

async function signup(t, n){
    try {
        const token = Crypto.randomBytes(20).toString('base64').slice(0, 20)
        const r = await fetch(n.ip+'/contacts/tokens', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                token, pubkey: n.pubkey,
            })
        })
        const json = await r.json()
        t.truthy(json.success)
        t.truthy(json.response && json.response.id) // new user id

        addFieldToNodeJson(n.pubkey, 'authToken', token)
        
        return token
    } catch(e) {
        console.log(e)
        t.true(false)
    }
}

async function getOwner(t, n) {
    const r = await fetch(n.ip+'/contacts', {
        method: 'GET',
        headers: headers(n.authToken)
    })
    const j = await r.json()
    t.true(j.success)
    t.truthy(j.response.contacts)

    const owner = j.response.contacts.find(c=> c.is_owner)
    t.truthy(owner)

    const id = owner.id
    t.truthy(id)

    return owner
}

async function createContactKey(t, n) {

    // console.log("NODE",n)

    const owner = await getOwner(t, n)
    const id = owner.id

    const {public,private} = await rsa.genKeys()
    addFieldToNodeJson(n.pubkey, 'contact_key', public)
    addFieldToNodeJson(n.pubkey, 'privkey', private)

    const r = await fetch(n.ip+'/contacts/' + id, {
        method:'PUT',
        headers: headers(n.authToken),
        body: JSON.stringify({
            contact_key: public
        })
    })
    const j = await r.json()
    t.truthy(j)

    const owner2 = await getOwner(t, n)
    t.truthy(owner2.contact_key)
}

async function clearNode(t, n) {
    const r2 = await fetch(n.ip+'/test_clear', {
        headers: headers(n.authToken),
    })
    const j2 = await r2.json()

    t.truthy(j2.success)
    t.truthy(j2.response && j2.response.clean) 
}

async function addFieldToNodeJson(pubkey, key, value){
    var nodes = require(path)
    const idx = nodes.findIndex(n=> n.pubkey===pubkey)
    if(idx<0) return
    nodes[idx][key] = value
    const jsonString = JSON.stringify(nodes, null, 2)
    fs.writeFileSync(pathToWrite, jsonString)
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

/*

supervisorctl restart relay
tail -f /var/log/supervisor/relay.log -n 1000

sqlite3 /relay/.lnd/sphinx.db

DELETE FROM sphinx_messages;
DELETE FROM sphinx_chats;
DELETE FROM sphinx_invites;
DELETE FROM sphinx_subscriptions;
DELETE FROM sphinx_contacts WHERE is_owner IS NULL;
UPDATE sphinx_contacts SET photo_url = null, alias = null, auth_token = null, contact_key = null, device_id = null;

*/
