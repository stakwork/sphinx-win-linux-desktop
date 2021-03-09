var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('clear all chats from nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.clearAllContacts, nodeArray, false) //always iterate: false
})