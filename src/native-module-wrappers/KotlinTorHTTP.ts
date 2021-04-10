import { NativeModule, NativeModules } from 'react-native'
const { OkHttpRNModule: KotlinTorHTTP } = NativeModules

interface KotlinTorHTTPInterface extends NativeModule {
  buildClient: (socksAddress: string) => Promise<boolean>;
  clearClient: () => void;

  requestGet: (
    url: string,
    headers: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;

  requestPut: (
    url: string,
    headers: Record<string, unknown>,
    jsonBody: string,
  ) => Promise<Record<string, unknown>>;

  requestPost: (
    url: string,
    headers: Record<string, unknown>,
    jsonBody: string,
  ) => Promise<Record<string, unknown>>;

  requestDelete: (
    url: string,
    headers: Record<string, unknown>,
    jsonBody?: string,
  ) => Promise<Record<string, unknown>>;
}

  export default KotlinTorHTTP as KotlinTorHTTPInterface
