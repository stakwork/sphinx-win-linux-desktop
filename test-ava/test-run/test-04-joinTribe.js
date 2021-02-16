var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test('create tribe, join tribe, send messages, leave tribe, delete tribe', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.joinTribe, nodeArray, true)
})