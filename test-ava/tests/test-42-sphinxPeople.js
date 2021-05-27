var test = require('ava');
var h = require('../helpers/helper-functions')
var r = require('../run-ava')
var http = require('ava-http');
var nodes = require('../nodes.json')

/*
npx ava test-42-sphinxPeople.js --verbose --serial --timeout=2m
*/

test('Sphinx People testing', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, sphinxPeople, nodeArray, false)
})

async function sphinxPeople(t, index1) {
//TESTING FOR SPHINX PEOPLE PAGE ===>

    let node1 = nodes[index1]
    console.log(node1.alias)

    //GET CHALLENGE FROM PEOPLE PAGE
    const ask = await http.get("http://"+r.tribeHost+"/ask")
    const challenge = ask.challenge
    t.true(typeof challenge === "string", "should return challenge string")

    //VERIFY EXTERNAL FROM RELAY
    const relayVerify = await http.post(node1.ip+"/verify_external", h.makeArgs(node1));
    const info = relayVerify.response.info
    t.true(typeof info === "object", "relay verification should return info object")
    const token = relayVerify.response.token
    t.true(typeof token === "string", "token string should exist")
    info.url = node1.ip
    info.route_hint = info.route_hint || ""
    info.alias = info.alias || ""
    t.true(info.url === node1.ip, "node1 ip should be added to info object")

    //TRIBE VERIFY
    const tribesVerify = await http.post("http://"+r.tribeHost+`/verify/${challenge}?token=${token}`, {body: info})
    t.truthy(tribesVerify, "tribe should verify")

    await h.sleep(1000)

    //TRIBE POLL
    const poll = await http.get("http://"+r.tribeHost+`/poll/${challenge}`)

    //POST PROFILE TO RELAY
    const priceToMeet = 13
    const postProfile = await http.post(node1.ip+"/profile", h.makeJwtArgs(poll.jwt, {
        host: r.tribeHost,
        owner_alias: node1.alias,
        description: "this description",
        img: poll.photo_url,
        tags: [],
        price_to_meet: priceToMeet
    })
    );
    t.true(postProfile.success, "post to profile should succeed")

    await h.sleep(1000)

    //GET PERSON FROM TRIBE SERVER
    const person = await http.get("http://"+r.tribeHost+"/person/"+poll.pubkey)

    //GET PERSON FROM RELAY
    const res = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
    //create node contact object from node perspective
    let self = res.response.contacts.find(contact => contact.public_key === node1.pubkey)

    //CHECK THAT PRICE TO MEET FROM TRIBES IS SAME AS PRICE TO MEET FROM RELAY
    t.true(person.price_to_meet === priceToMeet, "tribe server profile should have price to meet")
    t.true(person.price_to_meet === self.price_to_meet, "relay server should have price to meet")

    //UPDATE AND RESET PRICE_TO_MEET WITH PROFILE POST ID
    const newPriceToMeet = 0
    const postProfile2 = await http.post(node1.ip+`/profile`, h.makeJwtArgs(poll.jwt, {
        id: person.id,
        host: r.tribeHost,
        owner_alias: node1.alias,
        description: "this description",
        img: poll.photo_url,
        tags: [],
        price_to_meet: newPriceToMeet
    })
    );
    t.true(postProfile2.success, "post to profile with id should succeed")

    await h.sleep(1000)

    //GET PERSON FROM TRIBE SERVER
    const person2 = await http.get("http://"+r.tribeHost+"/person/"+poll.pubkey)

    //GET PERSON FROM RELAY
    const res2 = await http.get(node1.ip+'/contacts', h.makeArgs(node1));
    //create node contact object from node perspective
    let self2 = res2.response.contacts.find(contact => contact.public_key === node1.pubkey)

    //CHECK THAT PRICE TO MEET FROM TRIBES IS SAME AS PRICE TO MEET FROM RELAY
    t.true(person2.price_to_meet === newPriceToMeet, "tribes server should reset price to meet to newPriceToMeet")
    t.true(person2.price_to_meet === self2.price_to_meet, "Relay server should reset price to meet to newPriceToMeet")

    //TRY TO UPDATE AND RESET PRICE_TO_MEET WITH RANDOM ID
    try{
        const postRandomProfile = await http.post(node1.ip+`/profile`, h.makeJwtArgs(poll.jwt, {
            id: 321,
            host: r.tribeHost,
            owner_alias: node1.alias,
            description: "this description",
            img: poll.photo_url,
            tags: [],
            price_to_meet: newPriceToMeet
        })
        );
    }catch(e){ }

    //DELETE PERSON PROFILE AT END OF TEST
    console.log("deletion")
    const del = await http.del(node1.ip+"/profile", h.makeArgs(node1, {id: person2.id, host: r.tribeHost}))
    t.true(del.success, "profile should be deleted")

}

module.exports = sphinxPeople