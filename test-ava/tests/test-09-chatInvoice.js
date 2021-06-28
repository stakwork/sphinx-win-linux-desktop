var test = require('ava');
var h = require('../utils/helpers')
var r = require('../test-config')
var nodes = require('../nodes.json')
var f = require('../utils')

/*
npx ava test-09-chatInvoice.js --verbose --serial --timeout=2m
*/

test('test-09-chatInvoice: add contact, send invoices, pay invoices, delete contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, chatInvoice, nodeArray, r.iterate)
})

async function chatInvoice(t, index1, index2) {
//TWO NODES SEND PAYMENTS TO EACH OTHER IN A CHAT ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 ADDS NODE2 AS A CONTACT
    const added = await f.addContact(t, node1, node2)
    t.true(added, "n1 should add n2 as contact")

    //NODE1 SENDS A TEXT MESSAGE TO NODE2
    const text = h.randomText()
    let messageSent = await f.sendMessage(t, node1, node2, text)
    t.true(messageSent.success, "node1 should send text message to node2")

    //NODE2 SENDS A TEXT MESSAGE TO NODE1
    const text2 = h.randomText()
    let messageSent2 = await f.sendMessage(t, node2, node1, text2)
    t.true(messageSent2.success, "node2 should send text message to node1")

    //NODE1 SENDS INVOICE TO NODE2
    const amount = 11
    const paymentText = "this invoice"
    const invoice = await f.sendInvoice(t, node1, node2, amount, paymentText)
    t.truthy(invoice, 'invoice should be sent')
    const payReq = invoice.response.payment_request
    t.truthy(payReq, "payment request should exist")

    const payInvoice = await f.payInvoice(t, node2, node1, amount, payReq)
    t.true(payInvoice, "Node2 should have paid node1 invoice")

    //NODE2 SENDS INVOICE TO NODE1
    const amount2 = 12
    const paymentText2 = "that invoice"
    const invoice2 = await f.sendInvoice(t, node2, node1, amount2, paymentText2)
    t.truthy(invoice2, 'invoice should be sent')
    const payReq2 = invoice2.response.payment_request
    t.truthy(payReq2, "payment request should exist")

    const payInvoice2 = await f.payInvoice(t, node1, node2, amount2, payReq2)
    t.true(payInvoice2, "Node1 should have paid node2 invoice")

    //NODE1 AND NODE2 DELETE EACH OTHER AS CONTACTS
    let deletion = await f.deleteContacts(t, node1, node2)
    t.true(deletion, "contacts should be deleted")

}

module.exports = chatInvoice