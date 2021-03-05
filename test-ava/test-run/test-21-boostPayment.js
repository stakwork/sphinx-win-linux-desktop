var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, join tribe, send messages, boost messages, leave tribe, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.boostPayment, nodeArray, r.iterate)
})