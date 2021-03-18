var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, two nodes join tribe, send messages, check escrow, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Private, nodeArray, r.iterate)
})