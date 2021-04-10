import { errorMonitor } from "events"
import TorConnectionStore from "../store/torConnection"
import { performTorRequest, RequestMethod as RNTORRequestMethod } from "./tor-request-utils"

type ConstructorProps = {
  baseURLPath: string;
  authTokenKey?: string;
  authToken?: string;
  resetIPCallback?: Function;
  torConnectionStore?: TorConnectionStore | null;
}

type FetchWithTimeoutOptions = {
  headers: Headers,
  mode: RequestMode;
  method: string;
}

type TorRequestOptions = {
  headers: string[][];
  method: string;
}

export default class API {
  constructor({
    baseURLPath = '',
    authTokenKey = '',
    authToken = '',
    resetIPCallback = () => {},
    torConnectionStore = null,
  }: ConstructorProps) {
    this.torConnectionStore = torConnectionStore

    if (authTokenKey) this.tokenKey = authTokenKey
    if (authToken) this.tokenValue = authToken
    if (resetIPCallback) this.resetIPCallback = resetIPCallback

    this.get = addMethod('GET', baseURLPath)
    this.post = addMethod('POST', baseURLPath)
    this.put = addMethod('PUT', baseURLPath)
    this.del = addMethod('DELETE', baseURLPath)
    this.upload = addMethod('UPLOAD', baseURLPath)
  }

  torConnectionStore?: TorConnectionStore
  tokenKey: string
  tokenValue: string
  get: Function
  post: Function
  put: Function
  del: Function
  upload: Function
  resetIPCallback: Function


  fetchWithTimeout = async (
    url,
    timeoutMS,
    options: FetchWithTimeoutOptions
  ) => {
    const controller = new AbortController();

    const promise = fetch(url, { signal: controller.signal, ...options });
    const timeout = setTimeout(() => controller.abort(), timeoutMS);

    return promise.finally(() => clearTimeout(timeout));
  };


  performRequestUsingTor = async (
    url,
    options: TorRequestOptions,
  ) => {
    try {
      return await performTorRequest({
        url,
        socksAddress: this.torConnectionStore.torPortInfo.socksAddress,
        method: options.method as RNTORRequestMethod,
        headers: options.headers,
      })
    } catch (error) {
      throw error
    }
  }

  handleResultFromFetchRequest = async (result: Response, url: string, methodName: string) => {
    try {
      if (!result.ok) {
        console.log('Not OK!', result.status, url)
        return
      }

      let resultPayload
      if (methodName === 'BLOB') {
        resultPayload = await result.blob()
      } else {
        resultPayload = await result.json()
        debugger;
        if (resultPayload.token) {
          // localStorage.setItem(tokenName, res.token)
        }
        if (resultPayload.error) {
          console.warn(resultPayload.error)
          return
        }
        if (resultPayload.status && resultPayload.status === 'ok') { // invite server
          return resultPayload.object
        }
        if (resultPayload.success && resultPayload.response) { // relay
          return resultPayload.response
        }
        return resultPayload
      }
    } catch (e) { // 20 is an "abort" i guess
      console.warn(e)
      const isWebAbort = e.code === 20
      const isRNAbort = e.message === 'Aborted'
      if (isWebAbort || isRNAbort) reportTimeout(this.resetIPCallback)
    }
  }


  // TODO: How can we unify this with the deserialization that the fetchResult handler
  // is doing?
  handleResultFromTorRequest = async (resultPayload: Record<string, unknown>) => {
    if (resultPayload.status && resultPayload.status === 'ok') { // invite server
      return resultPayload.object
    }
    if (resultPayload.success && resultPayload.response) { // relay
      return resultPayload.response
    }

    return resultPayload
  }
}

const TIMEOUT = 20000


function addMethod(
  methodName: string,
  baseURLPath: string,
): Function {
  return async function (url: string, data: any, encoding?: string) {
    data = data || {}

    const skip = isPublic(baseURLPath + url)

    if (this.tokenKey && !this.tokenValue && !skip) {
      // throw new Error("no token")
      return
    }

    const headers: { [key: string]: string } = {}

    if (this.tokenKey && this.tokenValue) {
      headers[this.tokenKey] = this.tokenValue
    }

    const opts: { [key: string]: any } = { mode: 'cors' }

    if (methodName === 'POST' || methodName === 'PUT') {
      if (encoding) {
        headers['Content-Type'] = encoding
        if (encoding === 'application/x-www-form-urlencoded') {
          opts.body = makeSearchParams(data)
        } else {
          opts.body = data
        }
      } else {
        headers['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(data)
      }
    }
    if (methodName === 'UPLOAD') {
      headers['Content-Type'] = 'multipart/form-data'
      opts.body = data
      console.log("UPLOAD DATA:", data)
    }

    opts.headers = headers
    opts.method = methodName === 'UPLOAD' ? 'POST' : methodName

    if (methodName === 'BLOB') opts.method = 'GET'

    if (this.torConnectionStore?.isTorServiceActive) {
      const result = await this.performRequestUsingTor(baseURLPath + url, opts)

      return await this.handleResultFromTorRequest(result)
    } else {
      opts.headers = new Headers(opts.headers)
      const result = await this.fetchWithTimeout(baseURLPath + url, TIMEOUT, opts)

      return await this.handleResultFromFetchRequest(result, url, methodName)
    }
  }
}

let timeoutCount = 0

function reportTimeout(resetIPCallback:Function){
  timeoutCount += 1
  if(timeoutCount===3) {
    if(resetIPCallback) resetIPCallback()
  }
}

function isPublic(url: string) {
  return url.endsWith('login')
}


function makeSearchParams(params){
  return Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&')
}
