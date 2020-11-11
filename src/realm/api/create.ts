import { realm } from './realm.instance'
import { Create } from './types/create.interface'

/**
 * Create function
 * @param {string} props.schema - Name of schema where data will be created
 * @param {object | any} props.body - Object with the structure of the schema
 */
export default (props: Create) => {
  const { schema, body } = props;
  let response = null;
  try {
    realm.write(() => {
      const exists = realm.objects(schema).some((element: any) => element.id === body.id);
      if (exists) response = `${schema} already exist!`
      if (!exists) {
        response = realm.create(schema, body);
        console.log(`Created object in shcema: ${schema}`);
        console.log('response: ', response);
      }
    });
    return response;
  } catch (e) {
    console.log(`Error on creation with schema: ${schema}`);
    console.log(`body: ${body}`);
    console.log(`error: ${e}`);
    return e;
  }
}