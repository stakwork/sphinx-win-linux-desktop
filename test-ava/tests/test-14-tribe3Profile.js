var test = require('ava');
var h = require('../utils/helpers')
var r = require('../test-config')
var nodes = require('../nodes.json')
var f = require('../utils')

/*
npx ava test-14-tribe3Profile.js --verbose --serial --timeout=2m
*/

test('test-14-tribe3Profile: create tribe, two nodes join tribe, change alias and profile pic, check change, delete tribe', async t => {
    const nodeArray = r[r.active]
    await h.runTest(t, tribe3Profile, nodeArray, r.iterate)
})

async function tribe3Profile(t, index1, index2, index3) {
//THREE NODES EDIT AND CHECK PROFILE PICS AND ALIAS ===>

    let node1 = nodes[index1]
    let node2 = nodes[index2]
    let node3 = nodes[index3]
    t.truthy(node3, "this test requires three nodes")

    console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`)

    //NODE1 CREATES A TRIBE
    let tribe = await f.createTribe(t, node1)
    t.truthy(tribe, "tribe should have been created by node1")

    //NODE2 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join = await f.joinTribe(t, node2, tribe)
    t.true(join, "node2 should join tribe")

    //NODE3 JOINS TRIBE CREATED BY NODE1
    if(node1.routeHint) tribe.owner_route_hint = node1.routeHint
    let join2 = await f.joinTribe(t, node3, tribe)
    t.true(join2, "node3 should join tribe")

    //GET NODE1 PROFILE INFO
    const oldSelf = await f.getSelf(t, node1)
    console.log("OOOLD SELF === ", oldSelf)
    var oldName = oldSelf.alias
    var oldPic = oldSelf.photo_url || ''

    //NODE1 SENDS A TEXT MESSAGE IN TRIBE
    const text = h.randomText()
    let tribeMessage = await f.sendTribeMessage(t, node1, tribe, text)
    t.true(tribeMessage.success, "node1 should send message to tribe")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n2check = await f.checkDecrypt(t, node2, text, tribeMessage.message)
    t.true(n2check, "node2 should have read and decrypted node1 message")

    const lastMsg = await f.getCheckNewMsgs(t, node2, tribeMessage.message.uuid)
    console.log("oldName === ", oldName)
    console.log("lastMsg.sender_alias === ", oldName)
    console.log("oldPic === ", oldPic)
    console.log("lastMsg.sender_pic === ", oldName)

    t.true(lastMsg.sender_alias === oldName, "message alias should equal node1 old name")
    t.true(lastMsg.sender_pic === oldPic, "message profile pic should equal node1 old pic")

    //NODE1 CHANGES PROFILE ALIAS
    const newName = "New Name 1"
    const newAlias = {alias: newName}
    const change1 = await f.updateProfile(t, node1, newAlias)
    t.true(change1, "node1 should have changed its alias")

    //NODE1 CHANGES PROFILE PIC URL
    const newPic = "//imgur.com/a/axsiHTi"
    // const newPic = ''
    const newPhotoUrl = {photo_url: newPic}
    const change2 = await f.updateProfile(t, node1, newPhotoUrl)
    t.true(change2, "node1 should have changed its profile pic")

    //NODE1 SENDS A TEXT MESSAGE IN TRIBE
    const text2 = h.randomText()
    let tribeMessage2 = await f.sendTribeMessage(t, node1, tribe, text2)
    t.true(tribeMessage2.success, "node1 should send message to tribe")

    //CHECK THAT NODE1'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n2check2 = await f.checkDecrypt(t, node2, text2, tribeMessage2.message)
    t.true(n2check2, "node2 should have read and decrypted node1 message")
    const lastMsg2 = await f.getCheckNewMsgs(t, node2, tribeMessage2.message.uuid)
    t.true(lastMsg2.sender_alias === newName, "message alias should equal node1 new name")
    t.true(lastMsg2.sender_pic === newPic, "message profile pic should equal node1 new pic")

    //RESET NODE1 PROFILE
    const oldAlias = {alias: oldName}
    let reset1 = await f.updateProfile(t, node1, oldAlias)
    t.true(reset1, "node1 should have reset its old alias")
    const oldPhotoUrl = {photo_url: oldPic}
    let reset2 = await f.updateProfile(t, node1, oldPhotoUrl)
    t.true(reset2, "node1 should have reset its old profile pic")

    //GET NODE2 PROFILE INFO
    const oldSelf2 = await f.getSelf(t, node2)
    var oldName2 = oldSelf2.alias
    var oldPic2 = oldSelf2.photo_url || ''

    //NODE2 SENDS A TEXT MESSAGE IN TRIBE
    const text3 = h.randomText()
    let tribeMessage3 = await f.sendTribeMessage(t, node2, tribe, text3)
    t.true(tribeMessage3.success, "node1 should send message to tribe")

    //NODE1 CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n1check = await f.checkDecrypt(t, node1, text3, tribeMessage3.message)
    t.true(n1check, "node1 should have read and decrypted node2 message")

    const lastMsg3 = await f.getCheckNewMsgs(t, node1, tribeMessage3.message.uuid)
    t.true(lastMsg3.sender_alias === oldName2, "message alias should equal node2 old name")
    t.true(lastMsg3.sender_pic === oldPic2, "message profile pic should equal node2 old pic")

    //NODE3 CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n3check = await f.checkDecrypt(t, node3, text3, tribeMessage3.message)
    t.true(n3check, "node3 should have read and decrypted node2 message")

    const lastMsg4 = await f.getCheckNewMsgs(t, node3, tribeMessage3.message.uuid)
    t.true(lastMsg4.sender_alias === oldName2, "message alias should equal node2 old name")
    t.true(lastMsg4.sender_pic === oldPic2, "message profile pic should equal node2 old pic")


    //NODE2 CHANGES PROFILE ALIAS
    const newName2 = "New Name 2"
    const newAlias2 = {alias: newName2}
    const change3 = await f.updateProfile(t, node2, newAlias2)
    t.true(change3, "node2 should have changed its alias")

    //NODE2 CHANGES PROFILE PIC URL
    let change4 = await f.updateProfile(t, node2, newPhotoUrl)
    t.true(change4, "node2 should have changed its profile pic")

    //NODE2 SENDS A TEXT MESSAGE IN TRIBE
    const text4 = h.randomText()
    let tribeMessage4 = await f.sendTribeMessage(t, node2, tribe, text4)
    t.true(tribeMessage4.success, "node2 should send second message to tribe")

    //NODE1 CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n1check2 = await f.checkDecrypt(t, node1, text4, tribeMessage4.message)
    t.true(n1check2, "node1 should have read and decrypted node2 message")

    const lastMsg5 = await f.getCheckNewMsgs(t, node1, tribeMessage4.message.uuid)
    t.true(lastMsg5.sender_alias === newName2, "message alias should equal node2 new name")
    t.true(lastMsg5.sender_pic === newPic, "message profile pic should equal node2 new pic")

    //NODE3 CHECK THAT NODE2'S DECRYPTED MESSAGE IS SAME AS INPUT
    const n3check2 = await f.checkDecrypt(t, node3, text4, tribeMessage4.message)
    t.true(n3check2, "node3 should have read and decrypted node2 message")

    const lastMsg6 = await f.getCheckNewMsgs(t, node3, tribeMessage4.message.uuid)
    t.true(lastMsg6.sender_alias === newName2, "message alias should equal node2 new name")
    t.true(lastMsg6.sender_pic === newPic, "message profile pic should equal node2 new pic")

    //RESET NODE2 PROFILE
    const oldAlias2 = {alias: oldName2}
    let reset3 = await f.updateProfile(t, node2, oldAlias2)
    t.true(reset3, "node2 should have reset its old alias")
    const oldPhotoUrl2 = {photo_url: oldPic2}
    let reset4 = await f.updateProfile(t, node2, oldPhotoUrl2)
    t.true(reset4, "node2 should have reset its old profile pic")

    //NODE2 LEAVES THE TRIBE
    let n2left = await f.leaveTribe(t, node2, tribe)
    t.true(n2left, "node2 should leave tribe")

    //NODE3 LEAVES THE TRIBE
    let n3left = await f.leaveTribe(t, node3, tribe)
    t.true(n3left, "node3 should leave tribe")

    //NODE1 DELETES THE TRIBE
    let delTribe = await f.deleteTribe(t, node1, tribe)
    t.true(delTribe, "node1 should delete tribe")

}

module.exports = tribe3Profile