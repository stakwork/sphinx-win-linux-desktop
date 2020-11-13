import { realm } from './realm.instance'
import { Delete } from './types/delete.interface'

/**
 * Delete function
 * @param {string} props.schema - Name of schema where data will be deleted
 * @param {number} props.id - Id of the object that will be deleted
 * @param {string} props.type - Type of delete if type = all, all data of this schema will be deleted
 */
export default (props: Delete) => {
  const { schema, id, type } = props;
  let response = null;
  try {
    realm.write(() => {
      if (type === 'all') {
        console.log(`Deleting all objects in schema: ${schema}`);
        const all = realm.objects(schema);
        response = realm.delete(all);
        console.log(`Deleted: ${response}`)
        if (response === undefined) response = { deleted: true }
      }

      if (type === 'single') {
        console.log(`Deleting object in schema: ${schema} with id: ${id}`);
        const single = realm.objects(schema).find((e: any) => e.id === id);
        response = realm.delete(single);
        console.log(`Deleted: ${response}`)
        if (response === undefined) response = { deleted: true }
      }

    });
    return response;
  } catch (e) {
    console.log(`Error erasing in the schema: ${schema}`);
    console.log(`id: ${id}`);
    console.log(`error: ${e}`);
    return e;
  }
}