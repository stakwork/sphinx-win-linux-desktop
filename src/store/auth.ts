import { observable, action } from "mobx";
import { relay, composeAPI } from "../api";
import { persist } from "mobx-persist";
import { userStore } from "./user";

export interface Server {
  host: string;
}

const DEFAULT_AUTH_SERVER = "auth.sphinx.chat";

class AuthStore {
  @persist("list")
  @observable
  servers: Server[] = [{ host: DEFAULT_AUTH_SERVER }];

  @action getDefaultServer(): Server {
    const server = this.servers.find((s) => s.host === DEFAULT_AUTH_SERVER);
    return server;
  }

  @action
  async verify(id, challenge) {
    const pubkey = userStore.publicKey;
    if (!pubkey) return;

    const authServer = this.getDefaultServer();

    const r = await relay.get(`signer/${challenge}`);
    if (!(r && r.sig)) return;

    var q = new URLSearchParams({
      id,
      sig: r.sig,
      pubkey: pubkey,
    }).toString();
    const url = "https://" + authServer.host + "/oauth_verify?" + q;
  }

  @action
  async sign(challenge: string): Promise<string> {
    const r = await relay.get(`signer/${challenge}`);
    if (!(r && r.sig)) return "";
    return r.sig;
  }

  @action
  async externalTokens(): Promise<Object> {
    const r = await relay.get(`external_tokens`);
    return r;
  }

  @action
  async verifyExternal(): Promise<VerifyExternalResponse> {
    const r = await relay.post(`verify_external`);
    return r;
  }

  @action // U3BoaW54IFZlcmlmaWNhdGlvbg==
  async signBase64(b64: string): Promise<string> {
    const r2 = await relay.get(`signer/${b64}`);
    if (!(r2 && r2.sig)) return;
    return r2.sig;
  }
}

interface VerifyExternalResponse {
  info: { [k: string]: any };
  token: string;
}

export const authStore = new AuthStore();
