var http = require('ava-http');
var h = require('../helpers/helper-functions')
var rsa = require('../../public/electronjs/rsa')
var getContacts = require('./get-contacts')
var getCheckContacts = require('./get-check-contacts')
var getChats = require('./get-chats')

async function sendInvoice(t, node1, node2, amount, text){
//SEND INVOICE FROM NODE1 TO NODE2 ===>

    const [node1contact, node2contact] = await getCheckContacts(t, node1, node2)
    //encrypt random string with node1 contact_key
    const encryptedText = rsa.encrypt(node1contact.contact_key, text)
    //encrypt random string with node2 contact_key
    const remoteText = rsa.encrypt(node2contact.contact_key, text)

    const chats = await getChats(t, node1)
    const chat_id = chats[0].id

    //create node2 contact id
    contact_id = node2contact.id
    destination_key = ''

    //create payment object
    const v = {
        contact_id: contact_id || null,
        chat_id:  chat_id || null,
        amount: amount,
        destination_key,
        text: encryptedText,
        remote_text: remoteText
    }

    //post payment from node1 to node2
    const r = await http.post(node1.ip+'/invoices', h.makeArgs(node1, v))
    t.true(r.success, 'invoice should have been posted')

    return r

}

module.exports = sendInvoice