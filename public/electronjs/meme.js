const RNCryptor = require('jscryptor')

async function uploadMeme(file, typ, host, token) {
  try {

    let imgBuf = await readFileAsync(file);

    const newKey = crypto.randomBytes(20).toString('hex')

    const encImgBase64 = RNCryptor.Encrypt(imgBuf, newKey)

    var encImgBuffer = Buffer.from(encImgBase64, 'base64');

    const form = new FormData()
    form.append('file', encImgBuffer, {
      contentType: typ || 'image/jpg',
      filename: 'Image.jpg',
      knownLength: encImgBuffer.length,
    })
    const formHeaders = form.getHeaders()
    const resp = await fetch(`https://${host}/file`, {
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