/**
 * Message model for realm
 */
export default {
  name: 'Message',
  properties: {
    id: { type: 'int', default: null, optional: true },
    chat_id: { type: 'int', default: null, optional: true }, // id that indicate where does this message belong
    type: { type: 'int', default: null, optional: true },
    uuid: { type: 'string', default: null, optional: true },
    sender: { type: 'int', default: null, optional: true }, // id who sent the message
    receiver: { type: 'int', default: null, optional: true },
    amount: { type: 'double', default: null, optional: true },
    amount_msat: { type: 'double', default: null, optional: true },
    payment_hash: { type: 'string', default: null, optional: true },
    payment_request: { type: 'string', default: null, optional: true },
    date: { type: 'string', default: null, optional: true },
    expiration_data: { type: 'string', default: null, optional: true },
    message_content: { type: 'string', default: null, optional: true },
    remote_message_content: { type: 'string', default: null, optional: true },
    status: { type: 'int', default: null, optional: true },
    status_map: { type: 'StatusMap', default: null, optional: true },
    parent_id: { type: 'int', default: null, optional: true },
    subscription_id: { type: 'int', default: null, optional: true },
    media_type: { type: 'string', default: null, optional: true },
    media_token: { type: 'string', default: null, optional: true },
    media_key: { type: 'string', default: null, optional: true },
    seen: { type: 'bool', default: false, optional: true },
    created_at: { type: 'string', default: null, optional: true },
    updated_at: { type: 'string', default: null, optional: true },
    sender_alias: { type: 'string', default: null, optional: true },
    original_muid: { type: 'string', default: null, optional: true },
    reply_uuid: { type: 'string', default: null, optional: true },
    text: { type: 'string', default: null, optional: true },
    sold: { type: 'bool', default: null, optional: true },
    showInfoBar: { type: 'bool', default: null, optional: true },
    reply_message_content: { type: 'string', default: null, optional: true },
    reply_message_sender_alias: { type: 'string', default: null, optional: true },
    reply_message_sender: { type: 'int', default: null, optional: true },
    temp_uid: { type: 'string', default: null, optional: true },
  }
}