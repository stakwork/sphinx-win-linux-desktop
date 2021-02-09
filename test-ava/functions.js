var http = require('ava-http');
var rsa = require('../public/electronjs/rsa')
var meme = require('../public/electronjs/meme')
var fetch = require('node-fetch')
var RNCryptor = require('jscryptor-2')

//TESTING FUNCTIONS

async function addContact(t, node1, node2){
//NODE1 ADDS NODE2 AS A CONTACT

    //object of node2 for adding as contact
    const body = {
      alias: "node2",
      public_key: node2.pubkey,
      status: 1
  }

  //node1 adds node2 as contact
  const add = await http.post(node1.ip+'/contacts', makeArgs(node1, body))
  //create node2 id based on the post response
  var node2id = add && add.response && add.response.id
  //check that node2id is a number and therefore exists (contact was posted)
  t.true(typeof node2id === 'number')

  //await contact_key
  await sleep(1000)
  //node1 get all contacts
  let res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  //find if contact_key of node2 exists (based on pubkey)
  //create node2 contact object from node1 perspective 
  let n2contactP1 = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
  //create node1 contact object from node1 perspective
  let n1contactP1 = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
  //make sure node 2 has the contact_key
  t.truthy(n2contactP1.contact_key, "node2 should have a contact key")
  t.truthy(n1contactP1, "node1 should be its own first contact")

  return true

}

async function getSelf(t, node){
//GET CONTACT FOR NODE FROM NODE PERSPECTIVE ===>
  
    //get list of contacts from node perspective
    const res = await http.get(node.ip+'/contacts', makeArgs(node));
    //create node contact object from node perspective
    let nodeContact = res.response.contacts.find(contact => contact.public_key === node.pubkey)
    t.truthy(nodeContact)

    return nodeContact
  }

async function getContacts(t, node1, node2){
//GET CONTACT FOR NODE1 AND NODE2 FROM NODE1 PERSPECTIVE

      //get list of contacts from node1 perspective
      const res = await http.get(node1.ip+'/contacts', makeArgs(node1));
      //create node1 contact object from node1 perspective
      let n1contactP1 = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
      t.truthy(n1contactP1)
      //create node1 contact object from node2 perspective
      let n2contactP1 = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
      t.truthy(n2contactP1)

      return [n1contactP1, n2contactP1]


}

async function deleteContacts(t, node1, node2){
//NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS

  //get list of contacts from node2 perspective
  let res = await http.get(node2.ip+'/contacts', makeArgs(node2));
  //create node1 contact object from node2 perspective
  let node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
  //extract node1 id
  let node1id = node1contact.id

  //node2 find chat containing node2 id and node1 id
  let node2chat = res.response.chats.find(chat => arraysEqual(chat.contact_ids, [1, parseInt(node1id)]))
  //check that a chat exists with node1 from node2 perspective
  t.truthy(node2chat, 'node2 should have a chat with node1')

      //get list of contacts from node1 perspective
      res = await http.get(node1.ip+'/contacts', makeArgs(node1));
      //create node1 contact object from node2 perspective
      let node2contact = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
      //extract node1 id
      let node2id = node2contact.id

  //node2 deletes node1 contact
  const n2deln1 = await http.del(node2.ip+`/contacts/`+node1id, makeArgs(node2))
  //check that Node2 deleted Node1
  t.true(n2deln1.success, 'node2 should have deleted node1 contact')

  //get list of contacts from node1 perspective
  res = await http.get(node1.ip+'/contacts', makeArgs(node1));
  //node1 deletes node2 from contacts
  const n1deln2 = await http.del(node1.ip+`/contacts/`+node2id, makeArgs(node1))
  //check that node1 deleted node2
  t.true(n1deln2.success, "node1 should have deleted node2 contact")

  return true

}

async function sendMessage(t, node1, node2, text){
//NODE1 SENDS TEXT MESSAGE TO NODE2
  const [node1contact, node2contact] = await getContacts(t, node1, node2)
    //encrypt random string with node1 contact_key
    const encryptedText = rsa.encrypt(node1contact.contact_key, text)
    //encrypt random string with node2 contact_key
    const remoteText = rsa.encrypt(node2contact.contact_key, text)
    //create message object with encrypted texts
    const v = {
        contact_id: node2contact.id,
        chat_id: null,
        text: encryptedText,
        remote_text_map: {[node2contact.id]: remoteText},
        amount: 0,
        reply_uuid: "",
        boost: false,
    }

    //send message from node1 to node2
    const msg = await http.post(node1.ip+'/messages', makeArgs(node1, v))
    //make sure msg exists
    t.truthy(msg, "msg should exist")
    //wait for message to process
    await sleep(1000)
    //get list of messages from node2 perspective
    const msgRes = await http.get(node2.ip+'/messages', makeArgs(node2))
    //make sure that messages exist
    t.truthy(msgRes.response.new_messages, 'node2 should have at least one message')
    //extract the last message sent to node2
    const lastMessage = msgRes.response.new_messages[msgRes.response.new_messages.length-1]
    //decrypt the last message sent to node2 using node2 private key and lastMessage content
    const decrypt = rsa.decrypt(node2.privkey, lastMessage.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text should equal pre-encryption text')

    return true

}

async function sendImage(t, node1, node2, image, tribe){
//NODE1 SENDS AN IMAGE TO NODE2

    var token = await getToken(t, node1)
    var host = "memes.sphinx.chat"
    var fileBase64 = "data:image/jpg;base64,"+image
    var typ = "image/jpg"
    var filename = "Image.jpg"
    var isPublic = false

    const upload = await meme.uploadMeme(fileBase64, typ, host, token, filename, isPublic)
    t.truthy(upload, "meme should have been uploaded")
    t.truthy(upload.media_key, "upload should have media key")
    t.truthy(upload.muid, "upload should have muid")

    const [n1contactP1, n2contactP1] = await getContacts(t, node1, node2)

    let encrypted_media_key
    let encrypted_media_key2
    if(tribe){
      //encrypt media_key with node2 contact_key, node1 perspective
      encrypted_media_key = rsa.encrypt(n1contactP1.contact_key, upload.media_key)
      //encrypt media_key with node1 contact_key, node2 perspective
      encrypted_media_key2 = rsa.encrypt(tribe.group_key, upload.media_key)
    }
    else{
      //encrypt media_key with node2 contact_key, node1 perspective
      encrypted_media_key = rsa.encrypt(n1contactP1.contact_key, upload.media_key)
      //encrypt media_key with node1 contact_key, node2 perspective
      encrypted_media_key2 = rsa.encrypt(n2contactP1.contact_key, upload.media_key)
    }


    //media key map is  
    //person_sending_to: person_sending_to_contact_key,
    //person_sending: person_sending_contact_key

    //create empty media of object
    let i = {}

    //If tribe, create chat media object
    if(tribe){
      const tribeId = await getTribeId(t, node1, tribe)

      i = {
        contact_id: null,
        chat_id: tribeId,
        muid: upload.muid,
        media_key_map: {["chat"]: encrypted_media_key2, [n1contactP1.id]: encrypted_media_key},
        media_type: 'image/jpg',
        text: '',
        amount: 0,
        price: 0
    }
    }
    //if no tribe, create contact media object
    else {
          i = {
        contact_id: n2contactP1.id,
        chat_id: null,
        muid: upload.muid,
        media_key_map: {[n2contactP1.id]: encrypted_media_key2, [n1contactP1.id]: encrypted_media_key},
        media_type: 'image/jpg',
        text: '',
        amount: 0,
        price: 0
    }
    }

    //send message from node1 to node2
    const img = await http.post(node1.ip+'/attachment', makeArgs(node1, i))
    //make sure msg exists
    t.truthy(img, "sent image should exist")

    //get messages from node2 perspective
    const res = await http.get(node2.ip+'/messages', makeArgs(node2));
    //find last message
    t.truthy(res.response.new_messages, 'node1 should have at least one message')
    //extract the last message sent to node2
    const lastMessage2 = res.response.new_messages[res.response.new_messages.length-1]
    //get media key from message
    const node2MediaKey = lastMessage2.media_key

    const decryptMediaKey = rsa.decrypt(node2.privkey, node2MediaKey)

    //get media token
    var token = await getToken(t, node2)

    const url = `https://memes.sphinx.chat/file/${lastMessage2.media_token}`

    const res2 = await fetch(url, {headers: {Authorization: `Bearer ${token}`}})
    const blob = await res2.buffer()

    //media_key needs to be decrypted with your private key
    const dec = RNCryptor.Decrypt(blob.toString("base64"), decryptMediaKey)
    // const b64 = dec.toString('base64')
    // //check equality b64 to b64
    t.true(dec.toString("base64") === image)

    return true

}

async function createTribe(t, node) {
//NODE CREATES TRIBE ===>

  const name = `Test Tribe: ${node.alias}`
  const description = "A testing tribe"
  //new tribe object
  const newTribe = {
      name, description, tags: [],
      is_tribe: true,
      price_per_message: 0,
      price_to_join: 0,
      escrow_amount: 0,
      escrow_millis: 0,
      img: '',
      unlisted: true,
      private: false,
      app_url: '',
      feed_url: ''
    }

  //node1 creates new tribe
  let c = await http.post(node.ip+'/group', makeArgs(node, newTribe))
  //check that new tribe was created successfully
  t.true(c.success, "create tribe should be successful")
  //wait for post
  await sleep(1000)

  //save id of test tribe
  const newTribeId = c.response.id

  //node1 gets list of contacts and chats
  let res = await http.get(node.ip+'/contacts', makeArgs(node));
  //find the new tribe by id
  let r = res.response.chats.find(chat => chat.id === newTribeId)
  //check that the chat was found
  t.truthy(r, "the newly created chat should be found")

  //create tribe object
  const tribe = {
      name: r.name,
      uuid: r.uuid,
      group_key: r.group_key,
      amount: 0,
      host: r.host,
      img: r.img,
      owner_alias: r.owner_alias,
      owner_pubkey: r.owner_pubkey,
      private: r.private,
      my_alias: "",
      my_photo_url: ""
  }
  t.truthy(tribe, "created tribe object should exist")

  return tribe
}

async function joinTribe(t, node, tribe){
//NODE JOINS TRIBE ===>

    //node joins tribe
    const join = await http.post(node.ip+'/tribe', makeArgs(node, tribe))
    //check that join was successful
    t.true(join.success, "node2 should join test tribe")
    //wait for post
    await sleep(1000)

    return true
}

async function getTribeId(t, node, tribe){
//GET TRIBE ID FROM PERSPECTIVE OF NODE ===>

    //get list of contacts as node
    let con = await http.get(node.ip+'/contacts', makeArgs(node));
    //get test tribe id as node
    let findTribe = con.response.chats.find(chat=> chat.uuid === tribe.uuid)
    let tribeId = findTribe.id

    return tribeId
}

async function leaveTribe(t, node, tribe){
//NODE LEAVES THE TRIBE ===>

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //node2 leaves tribe
    const exit = await http.del(node.ip+`/chat/${tribeId}`, makeArgs(node))
    //check exit
    t.truthy(exit, "node should exit test tribe")

    return true
}

async function deleteTribe(t, node, tribe){
//NODE DELETES THE TRIBE ===>

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //node deletes the tribe
    let del = await http.del(node.ip+'/chat/'+tribeId, makeArgs(node))
    t.true(del.success, "node1 should delete the tribe")

    return true
}

async function sendTribeMessage(t, node, tribe, text){
//NODE POSTS MESSAGE TO TRIBE ===>

    let nodeContact = await getSelf(t, node)

    //encrypt random string with node contact_key
    const encryptedText = rsa.encrypt(nodeContact.contact_key, text)
    //encrypt random string with test tribe group_key from node1
    const remoteText = rsa.encrypt(tribe.group_key, text)

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //create test tribe message object
    const v = {
      contact_id: null,
      chat_id: tribeId,
      text: encryptedText,
      remote_text_map: {"chat": remoteText},
      amount: 0,
      reply_uuid: "",
      boost: false,
    }

    //send message from node to test tribe
    const msg = await http.post(node.ip+'/messages', makeArgs(node, v))
    //make sure msg1 exists
    t.truthy(msg, "node should send message to tribe")
    //wait for message to post
    await sleep(1000)

    return true

}

async function checkDecrypt(t, node, text){
//CHECK THAT THE LAST MESSAGE NODE RECEIVED IS EQUAL TO TEXT ===>

    //get list of messages from node perspective
    const msg = await http.get(node.ip+'/messages', makeArgs(node))
    //make sure that messages 1 exist
    t.truthy(msg.response.new_messages, 'node should have at least one message')
    //extract the last message sent to node
    const lastMsg = msg.response.new_messages[msg.response.new_messages.length-1]

    //decrypt the last message sent to node using node private key and lastMsg content
    const decrypt = rsa.decrypt(node.privkey, lastMsg.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text1 should equal pre-encryption text2')

    return true
}

//HELPER FUNCTIONS

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

  module.exports = {createTribe, joinTribe, getSelf, checkDecrypt, leaveTribe, deleteTribe, sendTribeMessage, getToken, deleteContacts, addContact, getContacts, sendMessage, sendImage, asyncForEach, randomText, makeArgs, arraysEqual, sleep, runTest}




  // BLANK TEST TEMPLATE === test('', async t => { });
//
//
// {
//   alias: user.invite.inviterNickname,
//   public_key: user.invite.inviterPubkey,
//   status: constants.contact_statuses.confirmed,
// }

// FORMATS

// RES
// res {
//   success: true,
//   response: {
//     contacts: [ [Object], [Object], [Object] ],
//     chats: [ [Object], [Object] ],
//     subscriptions: []
//   }
// }

// CONTACT
// {
//   id: 3,
//   public_key: '03a9a8d953fe747d0dd94dd3c567ddc58451101e987e2d2bf7a4d1e10a2c89ff38',
//   node_alias: null,
//   alias: 'Paul',
//   photo_url: null,
//   private_photo: null,
//   is_owner: 0,
//   deleted: 0,
//   auth_token: null,
//   remote_id: null,
//   status: 1,
//   contact_key: '',      CONTACT KEY WILL BE '' IF NO MESSAGE SENT
//   device_id: null,
//   created_at: '2021-01-26T18:12:13.707Z',
//   updated_at: '2021-01-26T18:12:13.707Z',
//   from_group: 1,
//   notification_sound: null,
//   last_active: null,
//   tip_amount: null
// }