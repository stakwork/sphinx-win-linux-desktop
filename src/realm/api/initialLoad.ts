import { create, hasData, delet } from './'
import { InitialLoad } from './types/initialLoad.interface'

/**
 * Initial load function that load the data of Contacts, Chats y Msg in realm
 * @param {Array<object | any>} props.contacts - Array of all the contact data
 */
export default (props: InitialLoad) => {
  const { contacts, chats, msg } = props;
  let response = null;
  try {
    const hasRealmData = hasData();
    if (contacts && !hasRealmData.contacts) {
      contacts.forEach((contact: any) => {
        create({
          schema: 'Contacts',
          body: { ...contact }
        })
      });
    }

    if (chats && !hasRealmData.chats) {
      chats.forEach((chat: any) => {
        create({
          schema: 'Chats',
          body: { ...chat }
        })
      });
    }

    if (msg && !hasRealmData.msg) {
      const allMessages: any = [];
      Object.values(msg.messages).forEach((c: any) => {
        c.forEach((msg: any) => {
          allMessages.push({
              ...msg,
              amount: parseInt(msg.amount) || 0,
          })
        })
      });

      const lastSeen = Object.keys(msg.lastSeen).map((key) => ({
        key: parseInt(key),
        seen: msg.lastSeen[key],
      }));

      const msgStructure = {
        messages: allMessages,
        lastSeen,
        lastFetched: msg.lastFetched || null,
        lastUpdated: msg.lastUpdated || null,
      }

      create({
        schema: 'Msg',
        body: { ...msgStructure }
      })
    }


    return response = { success: true };
  } catch (e) {
    console.log(`Error at initial load.`);
    console.log(`error: ${e}`);
    return {
      success: false,
      error: e,
    };
  }
}