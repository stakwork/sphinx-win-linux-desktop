import TorRNAndroid from '../native-module-wrappers/TorRNAndroid';


/**
 * Supported Request types
 */
export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}


type RequestOptions = {
  url: string;
  method: RequestMethod;
  data?: string;
  headers?: any;
}


export const performTorRequest = async ({
  url,
  method,
  data,
  headers,
}: RequestOptions) => {
  switch (method.toLowerCase()) {
    case RequestMethod.GET:
      const getResult = await TorRNAndroid.get(url, headers);
      if (getResult.json) {
        return getResult.json;
      }
    case RequestMethod.POST:
      const postResult = await TorRNAndroid.post(
        url,
        data || '',
        headers,
      );
      if (postResult.json) {
        return postResult.json;
      }
    case RequestMethod.DELETE:
      const deleteResult = await TorRNAndroid.delete(url, data, headers);
      if (deleteResult.json) {
        return deleteResult.json;
      }
      break;
  }
};
