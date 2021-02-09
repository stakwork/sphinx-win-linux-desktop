var test = require('ava');
var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var nodes = require('../nodes.json')
var f = require('../functions')
var meme = require('../../public/electronjs/meme')
var fetch = require('node-fetch')
var RNCryptor = require('jscryptor-2')
var node1 = nodes[0]
var node2 = nodes[1]



test('add contact, send message, delete contact', async t => {

//NODE1 ADDS NODE2 AS A CONTACT

    //object of node2 for adding as contact
    const body2 = {
        alias: "node2",
        public_key: node2.pubkey,
        status: 1
    }

    //node1 adds node2 as contact
    const add = await http.post(node1.ip+'/contacts', f.makeArgs(node1, body2))
    //create node2 id based on the post response
    var node2id = add && add.response && add.response.id
    //check that node2id is a number and therefore exists (contact was posted)
    t.true(typeof node2id === 'number')

    //await contact_key
    await f.sleep(1000)
    //node1 get all contacts
    let res = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    //find if contact_key of node2 exists (based on pubkey)
    //create node2 contact object from node1 perspective 
    let node2contact = res.response.contacts.find(contact => contact.public_key === node2.pubkey)
    //create node1 contact object from node1 perspective
    let node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
    //make sure node 2 has the contact_key
    t.truthy(node2contact.contact_key)

//NODE1 SENDS TEXT MESSAGE TO NODE2

    //create random string for message test
    const text = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
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
    const msg = await http.post(node1.ip+'/messages', f.makeArgs(node1, v))
    //make sure msg exists
    t.truthy(msg, "msg should exist")

    //wait for message to process
    await f.sleep(1000)
    //get list of messages from node2 perspective
    const msgRes = await http.get(node2.ip+'/messages', f.makeArgs(node2))
    //make sure that messages exist
    t.truthy(msgRes.response.new_messages, 'node2 should have at least one message')
    //extract the last message sent to node2
    const lastMessage = msgRes.response.new_messages[msgRes.response.new_messages.length-1]
    //decrypt the last message sent to node2 using node2 private key and lastMessage content
    const decrypt = rsa.decrypt(node2.privkey, lastMessage.message_content)
    //the decrypted message should equal the random string input before encryption
    t.true(decrypt === text, 'decrypted text should equal pre-encryption text')


//NODE2 SENDS AN IMAGE TO NODE1
    var token = await getToken(t, node2)
    var host = "memes.sphinx.chat"
    var fileBase64 = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACqADAAQAAAABAAAACgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IH2ElDQ19QUk9GSUxFAAEBAAAHyGFwcGwCIAAAbW50clJHQiBYWVogB9kAAgAZAAsAGgALYWNzcEFQUEwAAAAAYXBwbAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALZGVzYwAAAQgAAABvZHNjbQAAAXgAAAWKY3BydAAABwQAAAA4d3RwdAAABzwAAAAUclhZWgAAB1AAAAAUZ1hZWgAAB2QAAAAUYlhZWgAAB3gAAAAUclRSQwAAB4wAAAAOY2hhZAAAB5wAAAAsYlRSQwAAB4wAAAAOZ1RSQwAAB4wAAAAOZGVzYwAAAAAAAAAUR2VuZXJpYyBSR0IgUHJvZmlsZQAAAAAAAAAAAAAAFEdlbmVyaWMgUkdCIFByb2ZpbGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG1sdWMAAAAAAAAAHwAAAAxza1NLAAAAKAAAAYRkYURLAAAAJAAAAaxjYUVTAAAAJAAAAdB2aVZOAAAAJAAAAfRwdEJSAAAAJgAAAhh1a1VBAAAAKgAAAj5mckZVAAAAKAAAAmhodUhVAAAAKAAAApB6aFRXAAAAEgAAArhrb0tSAAAAFgAAAspuYk5PAAAAJgAAAuBjc0NaAAAAIgAAAwZoZUlMAAAAHgAAAyhyb1JPAAAAJAAAA0ZkZURFAAAALAAAA2ppdElUAAAAKAAAA5ZzdlNFAAAAJgAAAuB6aENOAAAAEgAAA75qYUpQAAAAGgAAA9BlbEdSAAAAIgAAA+pwdFBPAAAAJgAABAxubE5MAAAAKAAABDJlc0VTAAAAJgAABAx0aFRIAAAAJAAABFp0clRSAAAAIgAABH5maUZJAAAAKAAABKBockhSAAAAKAAABMhwbFBMAAAALAAABPBydVJVAAAAIgAABRxlblVTAAAAJgAABT5hckVHAAAAJgAABWQAVgFhAGUAbwBiAGUAYwBuAP0AIABSAEcAQgAgAHAAcgBvAGYAaQBsAEcAZQBuAGUAcgBlAGwAIABSAEcAQgAtAHAAcgBvAGYAaQBsAFAAZQByAGYAaQBsACAAUgBHAEIAIABnAGUAbgDoAHIAaQBjAEMepQB1ACAAaADsAG4AaAAgAFIARwBCACAAQwBoAHUAbgBnAFAAZQByAGYAaQBsACAAUgBHAEIAIABHAGUAbgDpAHIAaQBjAG8EFwQwBDMEMAQ7BEwEPQQ4BDkAIAQ/BEAEPgREBDAEOQQ7ACAAUgBHAEIAUAByAG8AZgBpAGwAIABnAOkAbgDpAHIAaQBxAHUAZQAgAFIAVgBCAMEAbAB0AGEAbADhAG4AbwBzACAAUgBHAEIAIABwAHIAbwBmAGkAbJAadSgAUgBHAEKCcl9pY8+P8Md8vBgAIABSAEcAQgAg1QS4XNMMx3wARwBlAG4AZQByAGkAcwBrACAAUgBHAEIALQBwAHIAbwBmAGkAbABPAGIAZQBjAG4A/QAgAFIARwBCACAAcAByAG8AZgBpAGwF5AXoBdUF5AXZBdwAIABSAEcAQgAgBdsF3AXcBdkAUAByAG8AZgBpAGwAIABSAEcAQgAgAGcAZQBuAGUAcgBpAGMAQQBsAGwAZwBlAG0AZQBpAG4AZQBzACAAUgBHAEIALQBQAHIAbwBmAGkAbABQAHIAbwBmAGkAbABvACAAUgBHAEIAIABnAGUAbgBlAHIAaQBjAG9mbpAaAFIARwBCY8+P8GWHTvZOAIIsACAAUgBHAEIAIDDXMO0w1TChMKQw6wOTA7UDvQO5A7oDzAAgA8ADwQO/A8YDrwO7ACAAUgBHAEIAUABlAHIAZgBpAGwAIABSAEcAQgAgAGcAZQBuAOkAcgBpAGMAbwBBAGwAZwBlAG0AZQBlAG4AIABSAEcAQgAtAHAAcgBvAGYAaQBlAGwOQg4bDiMORA4fDiUOTAAgAFIARwBCACAOFw4xDkgOJw5EDhsARwBlAG4AZQBsACAAUgBHAEIAIABQAHIAbwBmAGkAbABpAFkAbABlAGkAbgBlAG4AIABSAEcAQgAtAHAAcgBvAGYAaQBpAGwAaQBHAGUAbgBlAHIAaQENAGsAaQAgAFIARwBCACAAcAByAG8AZgBpAGwAVQBuAGkAdwBlAHIAcwBhAGwAbgB5ACAAcAByAG8AZgBpAGwAIABSAEcAQgQeBDEESQQ4BDkAIAQ/BEAEPgREBDgEOwRMACAAUgBHAEIARwBlAG4AZQByAGkAYwAgAFIARwBCACAAUAByAG8AZgBpAGwAZQZFBkQGQQAgBioGOQYxBkoGQQAgAFIARwBCACAGJwZEBjkGJwZFAAB0ZXh0AAAAAENvcHlyaWdodCAyMDA3IEFwcGxlIEluYy4sIGFsbCByaWdodHMgcmVzZXJ2ZWQuAFhZWiAAAAAAAADzUgABAAAAARbPWFlaIAAAAAAAAHRNAAA97gAAA9BYWVogAAAAAAAAWnUAAKxzAAAXNFhZWiAAAAAAAAAoGgAAFZ8AALg2Y3VydgAAAAAAAAABAc0AAHNmMzIAAAAAAAEMQgAABd7///MmAAAHkgAA/ZH///ui///9owAAA9wAAMBs/8AAEQgACgAKAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAHBwcHBwcMBwcMEQwMDBEXERERERcdFxcXFxcdIx0dHR0dHSMjIyMjIyMjKioqKioqMTExMTE3Nzc3Nzc3Nzc3P/bAEMBIiQkODQ4YDQ0YOacgJzm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5v/dAAQAAf/aAAwDAQACEQMRAD8AqUUUVqe2f//Z" //the word "image"
    var typ = "image/jpg"
    var filename = "Image.jpg"
    var isPublic = false

    const upload = await meme.uploadMeme(fileBase64, typ, host, token, filename, isPublic)
    t.truthy(upload, "meme should have been uploaded")
    t.truthy(upload.media_key, "upload should have media key")
    t.truthy(upload.muid, "upload should have muid")

    //get list of contacts from node2 perspective
    const contRes = await http.get(node2.ip+'/contacts', f.makeArgs(node2));
    console.log("RES === ", JSON.stringify(contRes.response.contacts))
    //create node1 contact object from node2 perspective
    const node1contactP2 = contRes.response.contacts.find(contact => contact.public_key === node1.pubkey)
    console.log("NODE1CONTACT === ", JSON.stringify(node1contactP2))
    //extract node1 id
    var node1id = node1contactP2.id

    //encrypt media_key with node1 contact_key
    console.log("NODE1CONTACT.CONTACT_KEY === ", node1contactP2.contact_key)
    console.log("upload.media_key === ", upload.media_key)
    const encrypted_media_key = rsa.encrypt(node1contactP2.contact_key, upload.media_key)

    //create message object with encrypted texts
    const i = {
        contact_id: node1id,
        chat_id: null,
        muid: upload.muid,
        media_key_map: {[node1contactP2.id]: encrypted_media_key},
        media_type: 'image/jpg',
        text: '',
        amount: 0,
        price: 0
    }

    //send message from node2 to node1
    const img = await http.post(node2.ip+'/attachment', f.makeArgs(node2, i))
    //make sure msg exists
    t.truthy(img, "sent image should exist")

    //get messages from node1 perspective
    res = await http.get(node1.ip+'/messages', f.makeArgs(node1));
    //find last message
    t.truthy(res.response.new_messages, 'node1 should have at least one message')
    //extract the last message sent to node2
    const lastMessage2 = res.response.new_messages[res.response.new_messages.length-1]
    console.log("LAST MESSAGE 2 === ", lastMessage2)
    //get media key from message
    const node1MediaKey = lastMessage2.media_key

    const decryptMediaKey = rsa.decrypt(node1.privkey, node1MediaKey)

    //get media token
    var token = await getToken(t, node1)

    const url = `https://memes.sphinx.chat/file/${lastMessage2.media_token}`

    const res3 = await fetch(url, {headers: {Authorization: `Bearer ${token}`}})
    console.log("RES3 === ",res3)
    const blob = await res3.buffer()

    console.log("DECRYPT MEDIA KEY === ", decryptMediaKey, blob.length)
    //media_key needs to be decrypted with your private key
    const dec = RNCryptor.Decrypt(blob.toString("base64"), decryptMediaKey)
    // const b64 = dec.toString('base64')
    console.log("DEC === ", dec)
    // //check equality b64 to b64    
    t.true(dec.toString("base64") === "/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACqADAAQAAAABAAAACgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IH2ElDQ19QUk9GSUxFAAEBAAAHyGFwcGwCIAAAbW50clJHQiBYWVogB9kAAgAZAAsAGgALYWNzcEFQUEwAAAAAYXBwbAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALZGVzYwAAAQgAAABvZHNjbQAAAXgAAAWKY3BydAAABwQAAAA4d3RwdAAABzwAAAAUclhZWgAAB1AAAAAUZ1hZWgAAB2QAAAAUYlhZWgAAB3gAAAAUclRSQwAAB4wAAAAOY2hhZAAAB5wAAAAsYlRSQwAAB4wAAAAOZ1RSQwAAB4wAAAAOZGVzYwAAAAAAAAAUR2VuZXJpYyBSR0IgUHJvZmlsZQAAAAAAAAAAAAAAFEdlbmVyaWMgUkdCIFByb2ZpbGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG1sdWMAAAAAAAAAHwAAAAxza1NLAAAAKAAAAYRkYURLAAAAJAAAAaxjYUVTAAAAJAAAAdB2aVZOAAAAJAAAAfRwdEJSAAAAJgAAAhh1a1VBAAAAKgAAAj5mckZVAAAAKAAAAmhodUhVAAAAKAAAApB6aFRXAAAAEgAAArhrb0tSAAAAFgAAAspuYk5PAAAAJgAAAuBjc0NaAAAAIgAAAwZoZUlMAAAAHgAAAyhyb1JPAAAAJAAAA0ZkZURFAAAALAAAA2ppdElUAAAAKAAAA5ZzdlNFAAAAJgAAAuB6aENOAAAAEgAAA75qYUpQAAAAGgAAA9BlbEdSAAAAIgAAA+pwdFBPAAAAJgAABAxubE5MAAAAKAAABDJlc0VTAAAAJgAABAx0aFRIAAAAJAAABFp0clRSAAAAIgAABH5maUZJAAAAKAAABKBockhSAAAAKAAABMhwbFBMAAAALAAABPBydVJVAAAAIgAABRxlblVTAAAAJgAABT5hckVHAAAAJgAABWQAVgFhAGUAbwBiAGUAYwBuAP0AIABSAEcAQgAgAHAAcgBvAGYAaQBsAEcAZQBuAGUAcgBlAGwAIABSAEcAQgAtAHAAcgBvAGYAaQBsAFAAZQByAGYAaQBsACAAUgBHAEIAIABnAGUAbgDoAHIAaQBjAEMepQB1ACAAaADsAG4AaAAgAFIARwBCACAAQwBoAHUAbgBnAFAAZQByAGYAaQBsACAAUgBHAEIAIABHAGUAbgDpAHIAaQBjAG8EFwQwBDMEMAQ7BEwEPQQ4BDkAIAQ/BEAEPgREBDAEOQQ7ACAAUgBHAEIAUAByAG8AZgBpAGwAIABnAOkAbgDpAHIAaQBxAHUAZQAgAFIAVgBCAMEAbAB0AGEAbADhAG4AbwBzACAAUgBHAEIAIABwAHIAbwBmAGkAbJAadSgAUgBHAEKCcl9pY8+P8Md8vBgAIABSAEcAQgAg1QS4XNMMx3wARwBlAG4AZQByAGkAcwBrACAAUgBHAEIALQBwAHIAbwBmAGkAbABPAGIAZQBjAG4A/QAgAFIARwBCACAAcAByAG8AZgBpAGwF5AXoBdUF5AXZBdwAIABSAEcAQgAgBdsF3AXcBdkAUAByAG8AZgBpAGwAIABSAEcAQgAgAGcAZQBuAGUAcgBpAGMAQQBsAGwAZwBlAG0AZQBpAG4AZQBzACAAUgBHAEIALQBQAHIAbwBmAGkAbABQAHIAbwBmAGkAbABvACAAUgBHAEIAIABnAGUAbgBlAHIAaQBjAG9mbpAaAFIARwBCY8+P8GWHTvZOAIIsACAAUgBHAEIAIDDXMO0w1TChMKQw6wOTA7UDvQO5A7oDzAAgA8ADwQO/A8YDrwO7ACAAUgBHAEIAUABlAHIAZgBpAGwAIABSAEcAQgAgAGcAZQBuAOkAcgBpAGMAbwBBAGwAZwBlAG0AZQBlAG4AIABSAEcAQgAtAHAAcgBvAGYAaQBlAGwOQg4bDiMORA4fDiUOTAAgAFIARwBCACAOFw4xDkgOJw5EDhsARwBlAG4AZQBsACAAUgBHAEIAIABQAHIAbwBmAGkAbABpAFkAbABlAGkAbgBlAG4AIABSAEcAQgAtAHAAcgBvAGYAaQBpAGwAaQBHAGUAbgBlAHIAaQENAGsAaQAgAFIARwBCACAAcAByAG8AZgBpAGwAVQBuAGkAdwBlAHIAcwBhAGwAbgB5ACAAcAByAG8AZgBpAGwAIABSAEcAQgQeBDEESQQ4BDkAIAQ/BEAEPgREBDgEOwRMACAAUgBHAEIARwBlAG4AZQByAGkAYwAgAFIARwBCACAAUAByAG8AZgBpAGwAZQZFBkQGQQAgBioGOQYxBkoGQQAgAFIARwBCACAGJwZEBjkGJwZFAAB0ZXh0AAAAAENvcHlyaWdodCAyMDA3IEFwcGxlIEluYy4sIGFsbCByaWdodHMgcmVzZXJ2ZWQuAFhZWiAAAAAAAADzUgABAAAAARbPWFlaIAAAAAAAAHRNAAA97gAAA9BYWVogAAAAAAAAWnUAAKxzAAAXNFhZWiAAAAAAAAAoGgAAFZ8AALg2Y3VydgAAAAAAAAABAc0AAHNmMzIAAAAAAAEMQgAABd7///MmAAAHkgAA/ZH///ui///9owAAA9wAAMBs/8AAEQgACgAKAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAHBwcHBwcMBwcMEQwMDBEXERERERcdFxcXFxcdIx0dHR0dHSMjIyMjIyMjKioqKioqMTExMTE3Nzc3Nzc3Nzc3P/bAEMBIiQkODQ4YDQ0YOacgJzm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5v/dAAQAAf/aAAwDAQACEQMRAD8AqUUUVqe2f//Z")

//NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS

    //get list of contacts from node2 perspective
    res = await http.get(node2.ip+'/contacts', f.makeArgs(node2));
    //create node1 contact object from node2 perspective
    node1contact = res.response.contacts.find(contact => contact.public_key === node1.pubkey)
    //extract node1 id
    node1id = node1contact.id

    //node2 find chat containing node2 id and node1 id
    let node2chat = res.response.chats.find(chat => f.arraysEqual(chat.contact_ids, [1, parseInt(node1id)]))
    //check that a chat exists with node1 from node2 perspective
    t.truthy(node2chat, 'node2 should have a chat with node1')

    //node2 deletes node1 contact
    const n2deln1 = await http.del(node2.ip+`/contacts/`+node1id, f.makeArgs(node2))
    //check that Node2 deleted Node1
    t.true(n2deln1.success, 'node2 should have deleted node1 contact')

    //get list of contacts from node1 perspective
    res = await http.get(node1.ip+'/contacts', f.makeArgs(node1));
    //node1 deletes node2 from contacts
    const n1deln2 = await http.del(node1.ip+`/contacts/`+node2id, f.makeArgs(node1))
    //check that node1 deleted node2
    t.true(n1deln2.success, "node1 should have deleted node2 contact")

});



async function getToken(t, node){
        //get authentication challenge from meme server
        const r = await http.get('https://memes.sphinx.chat/ask')
        console.log("R === ", JSON.stringify(r))
        t.truthy(r, "r should exist")
        t.truthy(r.challenge, "r.challenge should exist")
    
        //call relay server with challenge
        const r2 = await http.get(node.ip+`/signer/${r.challenge}`, f.makeArgs(node))
        console.log("R2 === ", JSON.stringify(r2))
        t.true(r2.success, "r2 should exist")
        t.truthy(r2.response.sig, "r2.sig should exist")
    
        //get server token
        const r3 = await http.post('https://memes.sphinx.chat/verify', {
        form: {id: r.id, sig: r2.response.sig, pubkey: node.pubkey}
        })
        console.log("R3 === ", JSON.stringify(r3))
        t.truthy(r3, "r3 should exist")
        t.truthy(r3.token, "r3.token should exist")
    
        return r3.token

}