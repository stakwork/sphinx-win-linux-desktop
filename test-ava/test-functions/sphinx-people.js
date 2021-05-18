// PEOPLE PAGE
// 1. tribes GET /ask (returns {challenge})
// challenge is random string

// APP
// 2. relay POST /verify_external (no body needed)
// This will return {info, token}
// Add your relay url (json "ip") to "info.url"

// 3. tribes POST /verify/${challenge}?token=${token}
// body of post is {info}

//await 1 sec sleep

// PEOPLE PAGE
// 4. tribes GET /poll/${challenge}
// Should return the info object, also includes "pubkey" now (also includes "jwt" string)

// 5. relay POST /profile with body of 
// {host, owner_alias, description, img, tags, price_to_meet}
//and use makeJwtArgs with "jwt" string
//host is "localhost:5002", "owner_alias", "description", img is string, tags is array, price_to_meet is number

// 5. tribes GET /people should have you in the list

// 6. relay GET /contacts (self should have price_to_meet the same as the profile on tribes)

var nodes = require('../nodes.json')
var f = require('../functions')
var b = require('../b64-images')

async function sphinxPeople(t, index1) {
//TESTING FOR SPHINX PEOPLE PAGE ===>


}

module.exports = sphinxPeople