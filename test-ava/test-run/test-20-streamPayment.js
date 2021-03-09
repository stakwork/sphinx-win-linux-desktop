var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('establish chat, node1 streams payment, node1 streams split payment, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.streamPayment, nodeArray, r.iterate)
})