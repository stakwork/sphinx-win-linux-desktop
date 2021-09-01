import { useState } from "react";
import { useStores } from "../../../src/store";
import * as aes from "../../crypto/aes";
import * as localForage from "localforage";

export function useCachedEncryptedFile(props, ldat) {
  const { meme } = useStores();
  const { id, media_key, media_type, media_token } = props;
  const [filename, setFileName] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [paidMessageText, setPaidMessageText] = useState(null);
  const isPaidMessage = media_type === "sphinx/text";

  async function trigger() {
    if (loading || data || paidMessageText) return; // already done
    if (!(ldat && ldat.host)) {
      return;
    }
    if (!ldat.sig || !media_key) {
      return;
    }

    const url = `https://${ldat.host}/file/${media_token}`;
    const server = meme.servers.find((s) => s.host === ldat.host);

    setLoading(true);

    // check if cached
    if (meme.checkCacheEnabled) {
      const dat: string = await localForage.getItem(ldat.muid);
      const fn = meme.cacheFileName[ldat.muid];
      if (fn) setFileName(fn);
      if (dat) {
        if (isPaidMessage) setPaidMessageText(dat);
        else setData(dat);
        setLoading(false);
        return; // load from cache!
      }
    }

    if (!server) return;
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${server.token}` },
      });
      const blob = await r.blob(); // need to do "text" for paid msg???
      const disp = r.headers.get("content-disposition");
      let theFileName = "file";
      if (disp) {
        const arr = disp.split("=");
        if (arr.length === 2) {
          const fn = arr[1];
          if (fn) theFileName = fn;
        }
      }
      let reader = new FileReader();
      reader.onload = async function () {
        // file content
        const res = String(reader.result);
        if (res.length === 0) {
          setLoading(false);
          return; // failed somehow
        }
        const idx = res.indexOf(",");
        const b64 = res.substring(idx + 1);
        let dat = "";
        if (isPaidMessage) {
          const dec = await aes.decrypt(b64, media_key);
          if (dec) {
            setPaidMessageText(dec);
            meme.addToCache(ldat.muid, String(dec), theFileName);
          }
        } else {
          console.log("DECRYPT NOW!!!!", media_type);
          const dec = await aes.decrypt64(b64, media_key);
          if (dec) {
            let mime = media_type;
            if (mime === "audio/m4a") mime = "audio/wav";
            setData(`data:${mime};base64,${dec}`);
            setFileName(theFileName);
            meme.addToCache(
              ldat.muid,
              `data:${mime};base64,${dec}`,
              theFileName
            );
          }
        }
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.log(e);
    }
  }

  return { data, loading, trigger, paidMessageText, filename };
}

export function useHasLink(m) {
  if (!(m && m.message_content)) return null;
  var messageArray = m.message_content.split(/\s+/); // any whitespace including newline
  var urlRegex =
    /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
  var link = null;
  messageArray.forEach(function (element) {
    if (urlRegex.test(element)) {
      if (!element.startsWith(`https://`)) {
        element = `https://` + element;
      }
      link = element;
    }
  });
  return link;
}
