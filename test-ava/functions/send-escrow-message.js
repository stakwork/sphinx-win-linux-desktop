var http = require('ava-http');
var rsa = require('../../public/electronjs/rsa')
var getSelf = require('./get-self')
var getTribeId = require('./get-tribe-id')
var getCheckNewMsgs = require('./get-check-newMsgs')
var getBalance = require('./get-balance')
var h = require('../helpers/helper-functions')
var r = require('../run-ava')

async function sendEscrowMsg(t, node, admin, tribe, text){
//NODE POSTS MESSAGE TO TRIBE ===>

    const escrowAmount = tribe.escrow_amount
    t.true(escrowAmount != 0, "escrow amount should not be zero")
    // console.log("escrowAmount === ", escrowAmount)

    const escrowMillis = tribe.escrow_millis
    t.true(escrowMillis != 0, "escrow time should not be zero")
    // console.log("escrowMillis === ", escrowMillis)

    var pricePerMessage = 0
    if(tribe.price_per_message) pricePerMessage = tribe.price_per_message
    // console.log("PPM === ", pricePerMessage)

    let nodeContact = await getSelf(t, node)

    //encrypt random string with node contact_key
    const encryptedText = rsa.encrypt(nodeContact.contact_key, text)
    //encrypt random string with test tribe group_key from node1
    const remoteText = rsa.encrypt(tribe.group_key, text)

    const tribeId = await getTribeId(t, node, tribe)
    t.truthy(tribeId, "node should get tribe id")

    //create test tribe message object
    const v = {
      contact_id: null,
      chat_id: tribeId,
      text: encryptedText,
      remote_text_map: {"chat": remoteText},
      amount: escrowAmount + pricePerMessage || 0,
      reply_uuid: "",
      boost: false,
    }

    //get balances BEFORE message
    const [nodeBalBefore, adminBalBefore] = await escrowBalances(t, node, admin)

    //send message from node to test tribe
    const msg = await http.post(node.ip+'/messages', h.makeArgs(node, v))
    //make sure msg exists
    t.true(msg.success, "node should send message to tribe")
    const msgUuid = msg.response.uuid
    t.truthy(msgUuid, "message uuid should exist")
    //await message to post
    const escrowMsg = await getCheckNewMsgs(t, node, msgUuid)
    t.truthy(escrowMsg, "should find escrow message posted")

    //get balances DURING escrow
    const [nodeBalDuring, adminBalDuring] = await escrowBalances(t, node, admin)
    //pause for escrow time
    await h.sleep(escrowMillis + 1)
    //get balances AFTER escrow
    const [nodeBalAfter, adminBalAfter] = await escrowBalances(t, node, admin)

    // console.log("adminBalBefore === ", adminBalBefore)
    // console.log("nodeBalBefore === ", nodeBalBefore)
    // console.log("adminBalDuring === ", adminBalDuring)
    // console.log("nodeBalDuring === ", nodeBalDuring)
    // console.log("adminBalAfter === ", adminBalAfter)
    // console.log("nodeBalAfter === ", nodeBalAfter)

    //ON VOLTAGE NODE:
    //ADMIN LOSES r.allowedFee BETWEEN DURING AND AFTER
    //NODE LOSES r.allowedFee BETWEEN BEFORE AND DURING

    //Check admin balances throughout
    if(adminBalBefore + pricePerMessage === adminBalAfter){
      t.true(adminBalBefore + pricePerMessage === adminBalAfter, "admin end balance should increase by ppm")
      t.true(adminBalBefore + escrowAmount + pricePerMessage === adminBalDuring, "admin should hold escrowAmount and ppm during escrow")
      t.true(adminBalDuring - escrowAmount === adminBalAfter, "admin should lose escrowAmount after escrowMillis")
    } else {
      t.true(adminBalBefore + pricePerMessage - r.allowedFee === adminBalAfter, "admin end balance should increase by ppm")
      t.true(adminBalBefore + escrowAmount + pricePerMessage === adminBalDuring, "admin should hold escrowAmount and ppm during escrow")
      t.true(adminBalDuring - escrowAmount - r.allowedFee === adminBalAfter, "admin should lose escrowAmount after escrowMillis")
    }

    //check node balances throughout
    if(nodeBalBefore - pricePerMessage === nodeBalAfter){
      t.true(nodeBalBefore - pricePerMessage === nodeBalAfter, "node end balance should decrease by ppm")
      t.true(nodeBalBefore - escrowAmount - pricePerMessage === nodeBalDuring, "node should lose escrowAmount and ppm during escrow")
      t.true(nodeBalDuring + escrowAmount === nodeBalAfter, "node should gain escrowAmount after escrowMillis")
    } else {
      t.true(nodeBalBefore - pricePerMessage - r.allowedFee === nodeBalAfter, "node end balance should decrease by ppm")
      t.true(nodeBalBefore - escrowAmount - pricePerMessage - r.allowedFee === nodeBalDuring, "node should lose escrowAmount and ppm during escrow")
      t.true(nodeBalDuring + escrowAmount === nodeBalAfter, "node should gain escrowAmount after escrowMillis")
    }


    return {success: true, message: msg.response}

}

async function escrowBalances(t, node, admin){
  const adminBal = await getBalance(t, admin)
  t.true(typeof adminBal === 'number'); 
  const nodeBal = await getBalance(t, node)
  t.true(typeof nodeBal === 'number'); 
  return [nodeBal, adminBal]
}


module.exports = sendEscrowMsg