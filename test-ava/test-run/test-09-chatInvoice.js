var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test('add contact, send invoices, pay invoices, delete contact', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.chatInvoice, nodeArray, true)
})