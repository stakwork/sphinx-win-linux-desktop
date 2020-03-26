import RNCryptor from 'react-native-rncryptor'

async function encrypt(txt, pwd): Promise<string> {
  try {
    const encryptedbase64 = await RNCryptor.encrypt(txt,pwd)
    return encryptedbase64
  } catch(e){
    console.log(e)
    return ''
  }
}

async function decrypt(txt, pwd): Promise<string> {
  try {
    const dec = await RNCryptor.decrypt(txt,pwd)
    return dec
  } catch(e){
    console.log(e)
    return ''
  }
}

async function testAES(){
  const msg='hi'
  const enc = await encrypt(msg,'pass')
  const dec = await decrypt(enc,'pass')
  console.log(dec,dec===msg)
}

export {encrypt,decrypt,testAES}
