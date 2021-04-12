import KotlinTorHTTP, { KotlinTorHTTPErrorCode, KotlinTorHTTPResponse, KotlinTorHTTPResponseKey } from '../native-module-wrappers/KotlinTorHTTP';


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
  socksAddress: string;
  method: RequestMethod;
  data?: string;
  headers?: string[][];
}


export async function startTorHTTPClientIfNotStarted(socksAddress: string) {
  try {
    await KotlinTorHTTP.buildClient(socksAddress)
  } catch (error) {
    console.log("startTorIfNotStarted error: " + error.message);

    if (error.code == KotlinTorHTTPErrorCode.BUILDER_CLIENT_EXISTS) {
      return
    } else {
      throw error
    }
  }
}


export const performTorRequest = async ({
  url,
  socksAddress,
  method,
  data,
  headers,
}: RequestOptions) => {
  if (socksAddress === '') {
    throw Error(`
      Attempted to perform Tor request to ${url} with an empty socksAddress.
    `)
  }

  await startTorHTTPClientIfNotStarted(socksAddress)

  let response: KotlinTorHTTPResponse;
  let responseBody: Record<string, unknown>;

  switch (method.toLowerCase()) {
    case RequestMethod.GET:
      console.log('Performing GET through Tor client to ' + url)
      response = await KotlinTorHTTP.requestGet(url, headers);
      debugger;

      if (response[KotlinTorHTTPResponseKey.CODE] == 200) {
        return JSON.parse(response[KotlinTorHTTPResponseKey.BODY])
      }

      throw Error(`Unknown result from performing Tor GET Request: ${response}`)

    case RequestMethod.PUT:
      response = await KotlinTorHTTP.requestPut(
        url,
        headers,
        data || '',
      );
      debugger;

      return JSON.parse(response[KotlinTorHTTPResponseKey.BODY])

    case RequestMethod.POST:
      console.log('Performing POST through Tor client to ' + url)

      response = await KotlinTorHTTP.requestPost(
        url,
        headers,
        data || '',
      );
      debugger;

      responseBody = JSON.parse(response[KotlinTorHTTPResponseKey.BODY])

      if (responseBody.success) {
        return responseBody
      } else {
        throw responseBody.error
      }

    case RequestMethod.DELETE:
      response = await KotlinTorHTTP.requestDelete(url, headers, data);
      debugger;

      return JSON.parse(response[KotlinTorHTTPResponseKey.BODY])

    default:
      throw Error(`Unexpected request method: ${method}`)
  }
};
