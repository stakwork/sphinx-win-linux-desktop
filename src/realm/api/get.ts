import { realm } from './realm.instance'
import { Get } from './types/get.interface'

/**
 * Get function
 * @param {string} props.schema - Name of schema where we will get data
 */
export default (props: Get) => {
  const { schema } = props;
  try {
    const resp = realm.objects(schema);
    return resp;
  } catch (e) {
    console.log(`Error on getting data from schema: ${schema}`);
    console.log(`error: ${e}`);
    return e;
  }
};