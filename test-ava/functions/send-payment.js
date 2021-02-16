var http = require('ava-http');
var h = require('../helpers/helper-functions')
var rsa = require('../../public/electronjs/rsa')
var getContacts = require('./get-contacts')
var getChats = require('./get-chats')

async function sendPayment(t, node1, node2, amount, text){
//SEND PAYMENT FROM NODE1 TO NODE2 ===>

    //get node1 balance before payment
    var node1bal = await http.get(node1.ip+'/balance', h.makeArgs(node1))
    t.true(node1bal.success, "should get node1 balance")
    const node1beforeBalance = node1bal.response.balance

    //get node2 balance before payment
    var node2bal = await http.get(node2.ip+'/balance', h.makeArgs(node2))
    t.true(node2bal.success, "should get node2 balance")
    const node2beforeBalance = node2bal.response.balance

    //get contacts from node1 perspective
    const [node1contact, node2contact] = await getContacts(t, node1, node2)
    //encrypt random string with node1 contact_key
    const encryptedText = rsa.encrypt(node1contact.contact_key, text)
    //encrypt random string with node2 contact_key
    const remoteText = rsa.encrypt(node2contact.contact_key, text)

    //find chat id of shared chat
    const chats = await getChats(t, node1)
    const sharedChat = chats.find(c => h.arraysEqual(c.contact_ids, [1, node2contact.id]))
    const chat_id = sharedChat.id

    //create node2 contact id
    const contact_id = node2contact.id
    //destination key
    const destination_key = ''

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
    const r = await http.post(node1.ip+'/payment', h.makeArgs(node1, v))
    t.true(r.success, 'payment should have been posted')

    //get node1 balance after payment
    node1bal = await http.get(node1.ip+'/balance', h.makeArgs(node1))
    t.true(node1bal.success, "should get node1 balance")
    const node1afterBalance = node1bal.response.balance

    //get node2 balance after payment
    node2bal = await http.get(node2.ip+'/balance', h.makeArgs(node2))
    t.true(node2bal.success, "should get node2 balance")
    const node2afterBalance = node2bal.response.balance

    //check that node1 sent payment and node2 received payment based on balances
    t.true((node1beforeBalance - amount) === node1afterBalance, "node1 should have paid amount")
    t.true((node2beforeBalance + amount) === node2afterBalance, "node2 should have received amount")

    return true

}

module.exports = sendPayment