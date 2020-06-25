import {randString} from '../../crypto/rand'
import RNFetchBlob from 'rn-fetch-blob'
import * as e2e from '../../crypto/e2e'

export async function fileUpload({
  server,
  uri,
  filename,
  filetype,
  text,
  isTextMsg,
  setUploadedPercent,
  finished,
}){

  const type = filename
  const name = filetype
  const pwd = await randString(32)
  if(!server) return
  if(!(uri || (isTextMsg&&text))) return

  let enc
  if (isTextMsg) {
    enc = await e2e.encrypt(text, pwd)
  } else {
    enc = await e2e.encryptFile(uri, pwd)
  }
  RNFetchBlob.fetch('POST', `https://${server.host}/file`, {
    Authorization: `Bearer ${server.token}`,
    'Content-Type': 'multipart/form-data'
  }, [{
      name:'file',
      filename:name,
      type: type,
      data: enc,
    }, {name:'name', data:name}
  ])
  // listen to upload progress event, emit every 250ms
  .uploadProgress({ interval : 250 },(written, total) => {
      console.log('uploaded', written / total)
      setUploadedPercent(Math.round((written / total)*100))
  })
  .then(async (resp) => {
    let json = resp.json()
    console.log('done uploading',json)
    finished({
      muid:json.muid,
      media_key:pwd,
      media_type:type,
    })
  })
  .catch((err) => {
     console.log(err)
  })
}