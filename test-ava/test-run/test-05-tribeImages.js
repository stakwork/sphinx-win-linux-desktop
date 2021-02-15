var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')

test.skip('create tribe, join tribe, send images, leave tribe, delete tribe', async t => {
    const nodeArray = [0, 1]
    await h.runTest(t, i.tribeImages, nodeArray, true)
})