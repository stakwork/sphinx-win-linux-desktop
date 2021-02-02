
function makeArgs(node, body) {
    return {
      headers : {'x-user-token':node.authToken},
      body
    }
  }
  
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  
  async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
  }

  module.exports = {makeArgs,arraysEqual,sleep}




  // BLANK TEST TEMPLATE === test('', async t => { });
//
//
// {
//   alias: user.invite.inviterNickname,
//   public_key: user.invite.inviterPubkey,
//   status: constants.contact_statuses.confirmed,
// }

// FORMATS

// RES
// res {
//   success: true,
//   response: {
//     contacts: [ [Object], [Object], [Object] ],
//     chats: [ [Object], [Object] ],
//     subscriptions: []
//   }
// }

// CONTACT
// {
//   id: 3,
//   public_key: '03a9a8d953fe747d0dd94dd3c567ddc58451101e987e2d2bf7a4d1e10a2c89ff38',
//   node_alias: null,
//   alias: 'Paul',
//   photo_url: null,
//   private_photo: null,
//   is_owner: 0,
//   deleted: 0,
//   auth_token: null,
//   remote_id: null,
//   status: 1,
//   contact_key: '',      CONTACT KEY WILL BE '' IF NO MESSAGE SENT
//   device_id: null,
//   created_at: '2021-01-26T18:12:13.707Z',
//   updated_at: '2021-01-26T18:12:13.707Z',
//   from_group: 1,
//   notification_sound: null,
//   last_active: null,
//   tip_amount: null
// }