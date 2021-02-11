var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var meme = require('../../public/electronjs/meme')
var fetch = require('node-fetch')
var RNCryptor = require('jscryptor-2')
var getContacts = require('./get-contacts')
var getTribeId = require('./get-tribe-id')
var h = require('../helpers/helper-functions')

async function sendImage(t, node1, node2, image, tribe){
//NODE1 SENDS AN IMAGE TO NODE2

    var token = await h.getToken(t, node1)
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
    const img = await http.post(node1.ip+'/attachment', h.makeArgs(node1, i))
    //make sure msg exists
    t.truthy(img, "sent image should exist")


    //get messages from node2 perspective
    const res = await http.get(node2.ip+'/messages', h.makeArgs(node2));
    //find last message
    t.truthy(res.response.new_messages, 'node1 should have at least one message')
    //extract the last message sent to node2
    const lastMessage2 = res.response.new_messages[res.response.new_messages.length-1]
    //get media key from message
    const node2MediaKey = lastMessage2.media_key

    const decryptMediaKey = rsa.decrypt(node2.privkey, node2MediaKey)

    //get media token
    var token = await h.getToken(t, node2)

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

module.exports = sendImage