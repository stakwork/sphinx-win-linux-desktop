var http = require('ava-http');
var h = require('../helpers/helper-functions')

async function createTribe(t, node) {
//NODE CREATES TRIBE ===>

  const name = `Test Tribe: ${node.alias}`
  const description = "A testing tribe"
  //new tribe object
  const newTribe = {
      name, description, tags: [],
      is_tribe: true,
      price_per_message: 0,
      price_to_join: 0,
      escrow_amount: 0,
      escrow_millis: 0,
      img: '',
      unlisted: true,
      private: false,
      app_url: '',
      feed_url: ''
    }

  //node1 creates new tribe
  let c = await http.post(node.ip+'/group', h.makeArgs(node, newTribe))
  //check that new tribe was created successfully
  t.true(c.success, "create tribe should be successful")
  //wait for post
  await h.sleep(1000)

  //save id of test tribe
  const newTribeId = c.response.id

  //node1 gets list of contacts and chats
  let res = await http.get(node.ip+'/contacts', h.makeArgs(node));
  //find the new tribe by id
  let r = res.response.chats.find(chat => chat.id === newTribeId)
  //check that the chat was found
  t.truthy(r, "the newly created chat should be found")

  //create tribe object
  const tribe = {
      name: r.name,
      uuid: r.uuid,
      group_key: r.group_key,
      amount: 0,
      host: r.host,
      img: r.img,
      owner_alias: r.owner_alias,
      owner_pubkey: r.owner_pubkey,
      private: r.private,
      my_alias: "",
      my_photo_url: ""
  }
  t.truthy(tribe, "created tribe object should exist")

  return tribe
}

module.exports = createTribe