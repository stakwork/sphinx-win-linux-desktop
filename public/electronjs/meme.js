const RNCryptor = require('jscryptor-2')
const base64 = require('base-64')
const crypto = require('crypto')
const FormData = require('form-data')
const fetch = require('node-fetch')

async function uploadMeme(fileBase64, typ, host, token, filename, isPublic) {

  try {

    let imgBuf = dataURLtoBuf(fileBase64);

    let finalImgBuffer
    let newKey = ''
    if(isPublic) {
      finalImgBuffer = Buffer.from(imgBuf)
    } else {
      newKey = crypto.randomBytes(20).toString('hex')
      const encImgBase64 = RNCryptor.Encrypt(imgBuf, newKey)
      finalImgBuffer = Buffer.from(encImgBase64, 'base64');
    }

    const form = new FormData()
    form.append('file', finalImgBuffer, {
      contentType: typ || 'image/jpg',
      filename: filename || 'Image.jpg',
      knownLength: finalImgBuffer.length,
    })
    const formHeaders = form.getHeaders()
    const resp = await fetch(`https://${host}/${isPublic?'public':'file'}`, {
      method: 'POST',
      headers: {
        ...formHeaders, // THIS IS REQUIRED!!!
        'Authorization': `Bearer ${token}`,
      },
      body: form
    })

    let json = await resp.json()
    if (!json.muid) throw new Error('no muid')

    return {
      muid: json.muid,
      media_key: newKey,
    }
    
  } catch (e) {
    throw e
  }
}

module.exports = { uploadMeme }

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  })
}

function dataURLtoBuf(dataurl) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = base64.decode(arr[1]),
    n = bstr.length, 
    u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr
}

function dataURLtoFile(dataurl, filename) {
 
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = base64.decode(arr[1]),
      n = bstr.length, 
      u8arr = new Uint8Array(n);
      
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, {type:mime});
}