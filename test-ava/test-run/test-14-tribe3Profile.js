var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create tribe, two nodes join tribe, change alias and profile pic, check change, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.tribe3Profile, nodeArray, r.iterate)
})