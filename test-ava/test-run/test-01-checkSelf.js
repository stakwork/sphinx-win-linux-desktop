var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test('check node exists, is own first contact', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.checkSelf, nodeArray)
})