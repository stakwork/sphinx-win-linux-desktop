var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, join tribe, send messages, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.joinTribe, nodeArray, r.iterate)
})