import TorConnectionStore from "../store/torConnection"
import { userStore } from "../store/user"
import { performTorRequest, RequestMethod as RNTORRequestMethod } from "./tor-request-utils"

type ConstructorProps = {
  baseURLPath: string;
  authTokenKey?: string;
  authToken?: string;
  resetIPCallback?: Function;
  torConnectionStore?: TorConnectionStore;
}

export default class API {
  constructor({
    baseURLPath = '',
    authTokenKey = '',
    authToken = '',
    resetIPCallback = () => {},
    torConnectionStore,
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

  torConnectionStore: TorConnectionStore
  tokenKey: string
  tokenValue: string
  get: Function
  post: Function
  put: Function
  del: Function
  upload: Function
  resetIPCallback: Function

  fetchWithTimeout = (url, timeoutMS, options = {}) => {
    const controller = new AbortController();

    let promise;

    if (this.torConnectionStore.isTorEnabled) {
      promise = performTorRequest({
        url,
        method: options.method as RNTORRequestMethod,
        headers: options.headers,
      })
    } else {
      promise = fetch(url, { signal: controller.signal, ...options });
    }

    const timeout = setTimeout(() => controller.abort(), timeoutMS);
    return promise.finally(() => clearTimeout(timeout));
  };
}

const TIMEOUT = 20000


function addMethod(
  methodName: string,
  baseURLPath: string,
): Function {
  return async function (url: string, data: any, encoding?: string) {
    data = data || {}

    try {
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
      opts.headers = new Headers(headers)

      opts.method = methodName === 'UPLOAD' ? 'POST' : methodName

      if (methodName === 'BLOB') opts.method = 'GET'

      const result = await this.fetchWithTimeout(baseURLPath + url, TIMEOUT, opts)

      if (!result.ok) {
        console.log('Not OK!', result.status, url)
        return
      }

      let resultPayload
      if (methodName === 'BLOB') {
        resultPayload = await result.blob()
      } else {
        resultPayload = await result.json()
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
