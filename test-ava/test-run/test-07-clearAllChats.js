var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test('clear all chats from nodes', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.clearAllChats, nodeArray)
})