var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test.skip('add contact, send payments, delete contact', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.chatPayment, nodeArray, true)
})