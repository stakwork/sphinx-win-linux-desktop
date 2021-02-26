var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('add contact, send invoices, pay invoices, delete contact', async t => {
    const nodeArray = r.twoNodes
    await h.runTest(t, i.chatInvoice, nodeArray, false)
})