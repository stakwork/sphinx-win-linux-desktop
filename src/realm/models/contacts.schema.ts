/**
 * Contact model for realm
 */
export default {
  name: 'Contacts',
  properties: {
    alias: { type: 'string', default: '', optional: true },
    auth_token: { type: 'string', default: '', optional: true },
    contact_key: { type: 'string', default: '', optional: true },
    created_at: { type: 'string', default: '', optional: true },
    deleted: { type: 'int', default: 0, optional: true },
    device_id: { type: 'string', default: '', optional: true },
    from_group: { type: 'int', default: 0, optional: true },
    id: { type: 'int', default: 0, optional: true },
    is_owner: { type: 'int', default: 0, optional: true },
    node_alias: { type: 'string', default: null, optional: true },
    notification_sound: { type: 'string', default: null, optional: true },
    photo_url: { type: 'string', default: '', optional: true },
    private_photo: { type: 'int', default: 0, optional: true },
    public_key: { type: 'string', default: '', optional: true },
    remote_id: { type: 'int', default: 0, optional: true },
    status: { type: 'int', default: 0, optional: true },
    updated_at: { type: 'string', default: '', optional: true },
  }
}