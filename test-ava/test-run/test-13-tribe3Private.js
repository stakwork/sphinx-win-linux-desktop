var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create private tribe, nodes ask to join, reject and accept, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Private, nodeArray, r.iterate)
})