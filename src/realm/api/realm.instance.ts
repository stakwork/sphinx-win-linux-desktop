import Realm from 'realm'
import {
  msgSchema,
  chatsSchema,
  messageSchema,
  contactsSchema,
  lastSeenSchema,
  statusMapSchema,
} from '../models'

/**
 * Create a new instance of realm with all the model schemas
 */
export const realm = new Realm({
  schema: [
    lastSeenSchema,
    statusMapSchema,
    chatsSchema,
    contactsSchema,
    messageSchema,
    msgSchema,
  ]
})