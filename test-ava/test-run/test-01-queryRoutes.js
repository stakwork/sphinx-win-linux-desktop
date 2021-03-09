var test = require('ava');
var h = require('../helpers/helper-functions')
var i = require('../test-functions')
var r = require('../run-ava')

test('check query routes between nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, i.queryRoutes, nodeArray, false) //always iterate: false
})