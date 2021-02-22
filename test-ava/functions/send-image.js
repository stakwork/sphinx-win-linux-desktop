var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var meme = require('../../public/electronjs/meme')
var fetch = require('node-fetch')
var RNCryptor = require('jscryptor-2')
var getContacts = require('./get-contacts')
var getTribeId = require('./get-tribe-id')
var getChats = require('./get-chats')
var getCheckNewMsgs = require('./get-check-newMsgs')
var getCheckContacts = require('./get-check-contacts')
var getCheckNewPaidMsgs = require('./get-check-newPaidMsgs')
var getSelf = require('./get-self')
var h = require('../helpers/helper-functions')

async function sendImage(t, node1, node2, image, tribe, price){
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

    var n1contactP1 = {}
    var n2contactP1 = {}
    if(tribe){
      [n1contactP1, n2contactP1] = await getContacts(t, node1, node2)
    } else {
      [n1contactP1, n2contactP1] = await getCheckContacts(t, node1, node2)
    }


    //encrypt media_key with node1 contact_key, node1 perspective
    let encrypted_media_key = rsa.encrypt(n1contactP1.contact_key, upload.media_key)
    let encrypted_media_key2
    let contactIdP1 = null
    let tribeIdP1 = null
    let mediaKeyMap = null
    if(tribe){
      //encrypt media_key with tribe group_key
      encrypted_media_key2 = rsa.encrypt(tribe.group_key, upload.media_key)
      tribeIdP1 = await getTribeId(t, node1, tribe)
      mediaKeyMap = {["chat"]: encrypted_media_key2, [n1contactP1.id]: encrypted_media_key}

    } else{
      //encrypt media_key with node2 contact_key, node1 perspective
      encrypted_media_key2 = rsa.encrypt(n2contactP1.contact_key, upload.media_key)
      contactIdP1 = n2contactP1.id
      mediaKeyMap = {[n2contactP1.id]: encrypted_media_key2, [n1contactP1.id]: encrypted_media_key}
    }

    //media key map is  
    //person_sending_to: person_sending_to_contact_key,
    //person_sending: person_sending_contact_key

    //create 
    let i = {
        contact_id: contactIdP1,
        chat_id: tribeIdP1,
        muid: upload.muid,
        media_key_map: mediaKeyMap,
        media_type: 'image/jpg',
        text: '',
        amount: 0,
        price: 0 || price
    }

    //send message from node1 to node2
    const img = await http.post(node1.ip+'/attachment', h.makeArgs(node1, i))
    //make sure msg exists
    t.true(img.success, "sent image should exist")
    const imgMsg = img.response
    var imgUuid = imgMsg.uuid

    if(price){
      //IF IMAGE HAS A PRICE ===>
      // //get messages from node2 perspective
      // const prePurchMsgs = await http.get(node2.ip+'/messages', h.makeArgs(node2));
      // //find last message
      // t.truthy(prePurchMsgs.response.new_messages, 'node2 should have at least one message')
      // //extract the last message sent to node2
      // const lastPrePurchMsg = prePurchMsgs.response.new_messages[prePurchMsgs.response.new_messages.length-1]
      const lastPrePurchMsg = await getCheckNewMsgs(t, node2, imgUuid)

      //create contact_id for purchase message
      var n2contactP2 = {}
      var n1contactP2 = {}
      if(tribe){
        [n2contactP2, n1contactP2] = await getContacts(t, node2, node1)
      } else {
        [n2contactP2, n1contactP2] = await getCheckContacts(t, node2, node1)
      }
      let purchContact = n1contactP2.id
      //create chat_id for purchase message (in tribe and outside tribe)
      let purchChat = null
      if(tribe){
        purchChat = await getTribeId(t, node2, tribe)
      } else {
        const chats = await getChats(t, node2)
        const selfie = await getSelf(t, node2)
        const selfId = selfie.id
        const sharedChat = chats.find(chat => h.arraysEqual(chat.contact_ids, [selfId, parseInt(n1contactP2.id)]))
        t.truthy(sharedChat, "there should be a chat with node1 and node2")
        purchChat = sharedChat.id
      }
      //create media_token for purchase message
      const mediaToken = lastPrePurchMsg.media_token

      //create purchase message object
      let p = {
          contact_id: purchContact,
          chat_id: purchChat,
          amount: price,
          media_token: mediaToken
      }

      //send purchase message from node2 purchasing node1 image
      const purchased = await http.post(node2.ip+'/purchase', h.makeArgs(node2, p))
      t.true(purchased.success, "purchase message should be posted " + purchased.error)
      //get payment accepted message
      var paymentMsg = await getCheckNewPaidMsgs(t, node2, imgMsg)
  //CONFIRM AND DECRYPT IMAGE

        //get media key from payment accepted message
        //(Last message by token.media_key, type 8, purchase message)
        const node2MediaKey = paymentMsg.media_key
    
        const decryptMediaKey = rsa.decrypt(node2.privkey, node2MediaKey)
    
        //get media token
        var token = await h.getToken(t, node2)
        const url = `https://memes.sphinx.chat/file/${paymentMsg.media_token}` //also purchase accept message
    
        const res2 = await fetch(url, {headers: {Authorization: `Bearer ${token}`}})
        const blob = await res2.buffer()
        //media_key needs to be decrypted with your private key
        const dec = RNCryptor.Decrypt(blob.toString("base64"), decryptMediaKey)
        // const b64 = dec.toString('base64')
        // //check equality b64 to b64
        t.true(dec.toString("base64") === image)

        return true

    } 

    //CONFIRM AND DECRYPT IMAGE

        // //get messages from node2 perspective
        // const res = await http.get(node2.ip+'/messages', h.makeArgs(node2));
        // //find last message
        // t.truthy(res.response.new_messages, 'node2 should have at least one message')
        // //extract the last message sent to node2
        // const lastMessage2 = res.response.new_messages[res.response.new_messages.length-1]
        const lastMessage2 = await getCheckNewMsgs(t, node2, imgUuid)

        //get media key from message (Last message by token.media_key, type 8, purchase message)
        const node2MediaKey = lastMessage2.media_key
        const decryptMediaKey = rsa.decrypt(node2.privkey, node2MediaKey)
    
        //get media token
        var token = await h.getToken(t, node2)
        const url = `https://memes.sphinx.chat/file/${lastMessage2.media_token}` //also purchase accept message
    
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