var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, edit tribe, check edits, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribeEdit, nodeArray, r.iterate)
})