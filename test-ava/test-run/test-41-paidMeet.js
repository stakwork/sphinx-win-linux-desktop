var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('update price_to_meet, add contact paid/unpaid, reset contact', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.paidMeet, nodeArray, false)
})