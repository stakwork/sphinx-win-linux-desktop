/**
 * Msg model for realm
 */
export default {
  name: 'Msg',
  properties: {
    messages: { type: 'Message[]' },
    lastSeen: { type: 'LastSeen[]' },
    lastFetched: { type: 'double', default: 0, optional: true },
    lastUpdated: { type: 'double', default: 0, optional: true },
  }
}