var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('Sphinx People testing', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.sphinxPeople, nodeArray, false)
})