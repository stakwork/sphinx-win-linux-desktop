var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('add contact, send images, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.imageTest, nodeArray, r.iterate)
})