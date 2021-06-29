var test = require('ava');
var h = require('../utils/helpers')
var r = require('../test-config')
var nodes = require('../nodes.json')
var http = require('ava-http');

/*
npx ava test-01-queryRoutes.js --verbose --serial --timeout=2m
*/

test('test-01-queryRoutes: check query routes between nodes', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, queryRoutes, nodeArray, false) //always iterate: false
})

async function queryRoutes(t, index1, index2, index3){
//CHECK THAT NODE EXISTS AND IS ITS OWN FIRST CONTACT ===>

    const nodeArray = [index1, index2]
    if(typeof(index3) === 'number') nodeArray.push(index3)

    await h.asyncForEach(nodeArray, async n => {
        await h.asyncForEach(nodeArray, async i => {
            if(n===i) return
            var checker = nodes[n]
            var checkee = nodes[i]
            
            let q = `pubkey=${checkee.pubkey}`
            if(checkee.routeHint) {
                q += `&route_hint=${checkee.routeHint}`
            }
            var route = await http.get(checker.ip+`/route?${q}`, h.makeArgs(checker))
            t.truthy(route.response.success_prob, "route response success prob should exist")
            t.true(typeof route.response.success_prob === "number", "route response success prob should be a number")
            t.true(route.response.success_prob > 0, "route response should be greater than 0")
            console.log(`${checker.alias} routed to ${checkee.alias}`)
        })
    })
}

module.exports = queryRoutes