import { observable, action } from "mobx";
import { relay } from "../api";
import * as e2e from "../crypto/e2e";

export interface Bot {
  id: string;
  chat_id: number;
  name: string;
  secret: string;
  created_at: string;
  updated_at: string;
}

class BotStore {
  @observable
  bots: Bot[] = [];

  @action async getBots() {
    const r = await relay.get("bots");
    if (r && r.bots) {
      this.bots = r.bots;
    }
  }

  @action async createBot(name: string, webhook: string) {
    const r = await relay.post("bot", {
      name,
      webhook,
    });
    if (r) {
      console.log(r);
      this.bots.push(r);
    }
  }

  @action async deleteBot(id: string) {
    const r = await relay.del(`bot/${id}`);
    if (r) {
      this.bots = this.bots.filter((b) => b.id !== id);
    }
  }

  // @action async getBotsForTribe(chat_id: number) {
  //   const r = await relay.get(`bots/${chat_id}`);
  //   if (r && r.bots) {
  //     this.bots = r.bots;
  //   }
  // }

  @action async postPat(pat: string) {
    try {
      const r1 = await relay.get("request_transport_key");
      const key = r1.transport_key;
      const encrypted_pat = await e2e.encryptPublic(pat, key);
      const r = await relay.post("bot/git", {
        encrypted_pat,
      });
      if (r) console.log(r);
    } catch (e) {
      console.log(e);
    }
  }

  @action reset() {
    this.bots = [];
  }
}

export const botStore = new BotStore();
