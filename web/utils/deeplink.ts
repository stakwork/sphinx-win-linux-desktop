import { chatStore } from "../../src/store/chats";
import { uiStore } from "../../src/store/ui";
import { authStore } from "../../src/store/auth";

const electron = window.require ? window.require("electron") : {};
const base64Fields = ["imgurl"];

export default function setupDeeplink() {
  if (electron.ipcRenderer) {
    electron.ipcRenderer.on("deeplink", (event, message) => {
      runAction(message);
    });
  }
}

async function runAction(url) {
  const j = jsonFromUrl(url);
  console.log(j);
  switch (j.action) {
    case "tribe":
      const tribe = await chatStore.getTribeDetails(j.host, j.uuid);
      uiStore.setViewTribe(tribe);
    case "auth":
      if (j.challenge && j.host) {
        uiStore.setTribesAuthParams(j);
      }
    case "save":
      if (j.key && j.host) {
        uiStore.setTribesSaveParams(j);
      }
    case "person":
      if (j.host && j.pubkey) {
        try {
          const r = await fetch("https://" + j.host + "/person/" + j.pubkey);
          const jj = await r.json();
          uiStore.setPersonParams(jj);
        } catch (e) {
          console.log(e);
        }
      }
  }
}

export function jsonFromUrl(url): { [k: string]: any } {
  const qIndex = url.indexOf("?");
  var query = url.substr(qIndex + 1);
  var result = {};
  query.split("&").forEach(function (s) {
    const idx = s.indexOf("=");
    const k = s.substr(0, idx);
    const v = s.substr(idx + 1);
    if (base64Fields.includes(k)) {
      result[k] = atob(v);
    } else {
      result[k] = v;
    }
  });
  return result;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
