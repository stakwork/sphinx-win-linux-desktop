/**
 * Chats model for realm
 */

 export default {
  name: 'Chats',
  properties: {
    app_url: { type: 'string', default: '', optional: true },
    contact_ids: { type: 'int[]', default: [] },
    created_at: { type: 'string', default: '' },
    deleted: { type: 'int', default: 0 },
    escrow_amount: { type: 'double', default: null, optional: true },
    escrow_millis: { type: 'double', default: null, optional: true },
    group_key: { type: 'string', default: '', optional: true },
    host: { type: 'string', default: '', optional: true },
    id: { type: 'int', default: 1 },
    is_muted: { type: 'int', default: 0, optional: true },
    name: { type: 'string', default: '', optional: true },
    owner_pubkey: { type: 'string', default: '', optional: true },
    pending_contact_ids: { type: 'int[]', default: [], optional: true },
    photo_url: { type: 'string', default: '', optional: true },
    price_per_message: { type: 'double', default: 0, optional: true },
    price_to_join: { type: 'double', default: 0, optional: true },
    private: { type: 'int', default: 0, optional: true },
    seen: { type: 'int', default: 0 },
    status: { type: 'string', default: '', optional: true },
    feed_url: { type: 'string', default: '', optional: true },
    type: { type: 'int', default: 0 },
    unlisted: { type: 'int', default: 0 },
    updated_at: { type: 'string', default: '' },
    uuid: { type: 'string', default: '' },
  }
}