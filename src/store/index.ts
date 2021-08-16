import React from "react";
import { detailsStore } from "./details";
import { uiStore } from "./ui";
import { msgStore } from "./msg";
import { contactStore } from "./contacts";
import { chatStore } from "./chats";
import { subStore } from "./subs";
import { userStore } from "./user";
import { memeStore } from "./meme";
import { authStore } from "./auth";
import { botStore } from "./bots";
import { themeStore } from "./theme";
import { feedStore } from "./feed";
import { queryStore } from "./queries";
import { create } from "mobx-persist";
import * as hookz from "./hooks";
import * as localForage from "localforage";
import { DEBOUNCE_TIME, persistMsgLocalForage } from "./storage";

const strg = {
  web: localForage,
};

const hydrate = create({
  storage: strg["web"] || localStorage,
  debounce: DEBOUNCE_TIME,
});

async function testAsyncStorage() {
  // const keys = await AsyncStorage.getAllKeys()
  // console.log("KEYS",keys)
  // const msgs = await AsyncStorage.getItem('msg')
  // console.log(msgs&&msgs.length, typeof msgs)
}

// check if in localforage
// ifnot, load from persist and into localforage
async function hydrateMessageStoreFromLocalforage() {
  const lfm: string = await localForage.getItem("_msg");
  if (lfm) {
    try {
      const rs = JSON.parse(lfm);
      msgStore.messages = rs.messages;
      msgStore.lastSeen = rs.lastSeen;
      msgStore.lastFetched = rs.lastFetched;
    } catch (e) {
      console.log("LOCALFORAGE ERROR", e);
    }
  } else {
    await hydrate("msg", msgStore);
    persistMsgLocalForage(msgStore);
  }
}

function initAndroid() {
  console.log("=> initialize store");
  Promise.all([
    hydrate("user", userStore),
    hydrate("details", detailsStore),
    hydrate("contacts", contactStore),
    hydrate("chats", chatStore),
    hydrate("meme", memeStore),
  ]).then(() => {
    console.log("=> store initialized");
    uiStore.setReady(true);
    testAsyncStorage();
  });
  hydrate("theme", themeStore);
}

function initWeb() {
  console.log("=> initialize store");
  Promise.all([
    hydrate("user", userStore),
    hydrate("details", detailsStore),
    hydrate("contacts", contactStore),
    hydrate("chats", chatStore),
    hydrate("meme", memeStore),
    // hydrate('msg', msgStore)
    hydrateMessageStoreFromLocalforage(),
  ]).then(() => {
    console.log("=> store initialized");
    uiStore.setReady(true);
  });
  hydrate("theme", themeStore);
}

initWeb();

const ctx = React.createContext({
  details: detailsStore,
  msg: msgStore,
  contacts: contactStore,
  chats: chatStore,
  subs: subStore,
  ui: uiStore,
  user: userStore,
  meme: memeStore,
  auth: authStore,
  bots: botStore,
  feed: feedStore,
  queries: queryStore,
});

export const useStores = () => React.useContext(ctx);

export const useTheme = () => React.useContext(React.createContext(themeStore));

export const hooks = hookz;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
