import { get } from '.'
import { HasData } from './types/hasData.interface'

/**
 * hasData function
 * function that return an object with the name of the main schemas
 * if one main schema has true value indicates that this schema has value
 * if one main schema has false value indicates that this schema has no value
 */
export default () => {
  try {
    const contacts: Array<any> = get({ schema: 'Contacts' });
    const chats: Array<any> = get({ schema: 'Chats' });
    const msg: Array<any> = get({ schema: 'Msg' });

    return {
      contacts: contacts.length ? true : false,
      chats: chats.length ? true : false,
      msg: msg.length ? true : false,
    } as HasData;
  } catch (e) {
    console.log(`Error at checking if data exist`);
    console.log(`error: ${e}`);
    return e;
  }
};