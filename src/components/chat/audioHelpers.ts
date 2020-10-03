import { PermissionsAndroid } from 'react-native'
import * as e2e from '../../crypto/e2e'
import {randString} from '../../crypto/rand'
import RNFetchBlob from 'rn-fetch-blob'

export async function uploadAudioFile(uri, server, callback){
  const pwd = await randString(32)
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
    callback(json.muid, pwd, type)
  })
  .catch((err) => {
    console.log(err)
  })
}

export async function requestAudioPermissions() {

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Permissions for write access',
        message: 'Give permission to your storage to write a file',
        buttonPositive: 'ok',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the storage');
    } else {
      console.log('permission denied');
      return;
    }
  } catch (err) {
    console.warn(err);
    return;
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Permissions for audio recording',
        message: 'Give permission to record audio',
        buttonPositive: 'ok',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can record audio');
    } else {
      console.log('permission denied');
      return;
    }
  } catch (err) {
    console.warn(err);
    return;
  }

}