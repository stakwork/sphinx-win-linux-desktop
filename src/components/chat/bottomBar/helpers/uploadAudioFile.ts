import {randString} from '../../../../crypto/rand'
import * as e2e from '../../../../crypto/e2e'
import RNFetchBlob from 'rn-fetch-blob'

export default async function uploadAudioFile(uri, meme, sendFinalMsg, setUploading){
  const pwd = await randString(32)
  const server = meme.getDefaultServer()
  if(!server) return
  if(!uri) return

  const type = 'audio/mp4'
  const filename = 'sound.mp4'
  let enc = await e2e.encryptFile(uri, pwd)
  RNFetchBlob.fetch('POST', `https://${server.host}/file`, {
    Authorization: `Bearer ${server.token}`,
    'Content-Type': 'multipart/form-data'
  }, [{
      name:'file',
      filename,
      type: type,
      data: enc,
    }, {name:'name', data:filename}
  ])
  // listen to upload progress event, emit every 250ms
  .uploadProgress({ interval : 250 },(written, total) => {
      console.log('uploaded', written / total)
      // setUploadedPercent(Math.round((written / total)*100))
  })
  .then(async (resp) => {
    let json = resp.json()
    console.log('done uploading',json)
    await sendFinalMsg({
      muid:json.muid,
      media_key:pwd,
      media_type:type,
    })
    setUploading(false)
  })
  .catch((err) => {
     console.log(err)
  })
}