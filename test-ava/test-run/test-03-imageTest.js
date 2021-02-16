var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test('add contact, send images, delete contacts', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.imageTest, nodeArray, true)
})