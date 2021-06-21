var test = require('ava');
var h = require('../utils/helpers')
var r = require('../run-ava')
var nodes = require('../nodes.json')
var f = require('../utils')

/*
npx ava test-15-tribeEdit.js --verbose --serial --timeout=2m
*/

test('test-15-tribeEdit: create tribe, edit tribe, check edits, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, tribeEdit, nodeArray, r.iterate)
})

async function tribeEdit(t, index1, index2) {
//A NODE MAKES EDITS TO A TRIBE IT CREATED ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]

    console.log(`${node1.alias} and ${node2.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //GET TRIBE ID FROM NODE1 PERSPECTIVE
    const tribeId = await f.getTribeId(t, node1, tribe)
    t.true(typeof tribeId === "number")

    //CREATE TRIBE BODY WITH EDITED PRICE_TO_JOIN
    const newPriceToJoin = 12
    const newDescription = "Edited Description"
    const body = {
        name: tribe.name || 0,
        price_per_message: tribe.price_per_message || 0,
        price_to_join: newPriceToJoin,
        escrow_amount: tribe.escrow_amount || 0,
        escrow_millis: tribe.escrow_millis || 0,
        img: tribe.img || '',
        description: newDescription,
        tags: [],
        unlisted: true,
        app_url: '',
        feed_url: '',
      }

    //USE TRIBE ID AND EDITED BODY TO EDIT THE TRIBE
    const edit = await f.editTribe(t, node1, tribeId, body)
    t.true(edit.success, "edit should have succeeded")
    t.true(edit.tribe.price_to_join === newPriceToJoin, "new price to join should be included in edit")

    //GET ALL CHATS FROM NODE1 PERSPECTIVE
    const node1Chats = await f.getChats(t, node1)
    const editedTribe = await node1Chats.find(c => c.id === tribeId)
    t.truthy(editedTribe, "tribe should be listed in node1 chats")
    t.true(editedTribe.price_to_join === newPriceToJoin, "fetched chat should show edit")

    //FETCH TRIBE FROM TRIBE SERVER TO CHECK EDITS
    const tribeFetch = await f.tribeHost.getByUuid(t, tribe)
    t.true(typeof tribeFetch === "object", "fetched tribe object should exist")
    t.true(tribeFetch.price_to_join === newPriceToJoin, "tribe server should show new price")
    t.true(tribeFetch.description === newDescription, "tribe server should show new description")

    //NODE2 LEAVES THE TRIBE
    let left = await f.leaveTribe(t, node2, tribe)
    t.true(left, "node2 should leave tribe")

    //NODE1 DELETES THE TRIBE
    let delTribe = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe, "node1 should delete tribe")

}

module.exports = tribeEdit