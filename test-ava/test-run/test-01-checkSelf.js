var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('check node exists, is own first contact', async t => {
    const nodeArray = r.twoNodes
    await h.runTest(t, i.checkSelf, nodeArray, true)
})