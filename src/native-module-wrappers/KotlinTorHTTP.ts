import { NativeModule, NativeModules } from 'react-native'
const { OkHttpRNModule: KotlinTorHTTP } = NativeModules


export enum KotlinTorHTTPErrorCode {
  BUILDER_CLIENT_EXISTS = "BUILDER_CODE_CLIENT_EXISTS",
  BUILDER_PROXY_ERROR = "BUILDER_CODE_PROXY_ERROR",
  BUILDER_TIMEOUT = 20,
  BUILDER_PING_INTERVAL = 30,

  REQUEST_CALL_EXCEPTION = "REQUEST_CODE_CALL_EXCEPTION",
  REQUEST_CLIENT_EXCEPTION = "REQUEST_CODE_CLIENT_EXCEPTION",
  REQUEST_HEADER_EXCEPTION = "REQUEST_CODE_HEADER_EXCEPTION",
  REQUEST_CANCELLATION = "REQUEST_CODE_REQUEST_CANCELLATION",
}

export enum KotlinTorHTTPResponseKey {
  BODY = "RESPONSE_BODY",
  CODE = "RESPONSE_CODE",
  HEADERS = "RESPONSE_HEADERS",
}

export type KotlinTorHTTPResponse = {
  [KotlinTorHTTPResponseKey.CODE]: number;
  [KotlinTorHTTPResponseKey.BODY]: string;
  [KotlinTorHTTPResponseKey.HEADERS]: Record<string, string[]>;
}

interface KotlinTorHTTPInterface extends NativeModule {
  buildClient: (socksAddress: string) => Promise<boolean>;
  clearClient: () => void;

  requestGet: (
    url: string,
    headers: string[][],
  ) => Promise<KotlinTorHTTPResponse>;

  requestPut: (
    url: string,
    headers: string[][],
    jsonBody: string,
  ) => Promise<KotlinTorHTTPResponse>;

  requestPost: (
    url: string,
    headers: string[][],
    jsonBody: string,
  ) => Promise<KotlinTorHTTPResponse>;

  requestDelete: (
    url: string,
    headers: string[][],
    jsonBody?: string,
  ) => Promise<KotlinTorHTTPResponse>;
}

  export default KotlinTorHTTP as KotlinTorHTTPInterface
