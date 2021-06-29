var http = require('ava-http');
var h = require('./helpers')
var getCheckTribe = require('./get/get-check-tribe')

async function createTribe(t, node, escrowAmount, escrowMillis, ppm, privacy) {
//NODE CREATES TRIBE ===>

  const name = `Test Tribe: ${node.alias}`
  const description = "A testing tribe"
  //new tribe object
  const newTribe = {
      name, description, tags: [],
      is_tribe: true,
      price_per_message: ppm || 0,
      price_to_join: 0,
      escrow_amount: escrowAmount || 0,
      escrow_millis: escrowMillis || 0,
      img: '',
      unlisted: true,
      private: privacy || false,
      app_url: '',
      feed_url: ''
    }

  //node1 creates new tribe
  let c = await http.post(node.ip+'/group', h.makeArgs(node, newTribe))
  //check that new tribe was created successfully
  t.true(c.success, "create tribe should be successful")

  //save id of test tribe
  const newTribeId = c.response.id
  //get new tribe by Id
  const r = await getCheckTribe(t, node, newTribeId)
  //check that the chat was found
  t.true(typeof r === "object", "the newly created chat should be found")

  //create tribe object
  const tribe = {
      name: r.name,
      uuid: r.uuid,
      group_key: r.group_key,
      // amount: 0,
      host: r.host,
      price_per_message: r.price_per_message || 0,
      escrow_amount: r.escrow_amount || 0,
      escrow_millis: r.escrow_millis || 0,
      img: r.img,
      owner_alias: r.owner_alias,
      owner_pubkey: r.owner_pubkey,
      private: r.private,
      my_alias: "",
      my_photo_url: "",
  }
  t.truthy(tribe, "created tribe object should exist")

  return tribe
}

module.exports = createTribe