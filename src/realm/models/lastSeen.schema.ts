/**
 * lastSeen model for realm
 */
export default {
  name: 'LastSeen',
  properties: {
    key: { type: 'int', default: null, optional: true },
    seen: { type: 'double', default: null, optional: true },
  }
}