import { realm } from './realm.instance'
import { Update } from './types/update.interface'

/**
 * Update function
 * @param {string} props.schema - Name of schema where data will be updated
 * @param {number} props.id - Id of the object that will be modified
 * @param {object | any} props.body - Object with the structure of the schema
 */
export default (props: Update) => {
  const { schema, id, body } = props;
  let response = null;
  try {
    realm.write(() => {
      // console.log(`Updating object in schema: ${schema}`);
      response = realm.objects(schema).find((e: any) => e.id === id);
      if (schema === 'Msg') response = realm.objects(schema)[0]
      const availableFields = [];
      for (let key in response) availableFields.push(key);
      let hasEqualBody = true;

      Object.keys(body).forEach((key: string) => {
        if (!availableFields.includes(key)) {
          console.log(`Invalid key: ${key} trying to update schema ${schema}`);
          hasEqualBody = false;
          response = null;
        }
      })

      if (hasEqualBody) {
        if (schema !== 'Msg') Object.assign(response, body);
        if (schema === 'Msg') {
          response.messages = body.messages;
          response.lastSeen = body.lastSeen;
          response.lastFetched = body.lastFetched;
        }
        // if (schema === 'Msg') console.log('updatedObject: ', response.messages.length);
        // if (schema !== 'Msg') console.log('updatedObject: ', response);
      }
    });
    return response;
  } catch (e) {
    console.log(`Error on update the schema: ${schema}`);
    console.log(`id: ${id}`);
    console.log(`body: ${body}`);
    console.log(`error: ${e}`);
    return e;
  }
}