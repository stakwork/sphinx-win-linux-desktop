var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('create timestamp, add contact and chat, get latest, delete contacts', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.latestTest, nodeArray, false)
})