var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, create bot, add bot to tribe, delete bot, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.botCreation, nodeArray, false)
})