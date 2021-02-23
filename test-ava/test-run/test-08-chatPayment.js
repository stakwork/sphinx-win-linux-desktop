var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('add contact, send payments, delete contact', async t => {
    const nodeArray = r.threeNodes
    await h.runTest(t, i.chatPayment, nodeArray, true)
})