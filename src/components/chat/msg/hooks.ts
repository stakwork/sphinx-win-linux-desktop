import React, {useEffect, useState} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import {parseLDAT} from '../../utils/ldat'
import {useStores} from '../../../store'
import * as aes from '../../../crypto/aes'

const sess = 'all'

let dirs = RNFetchBlob.fs.dirs

// RNFetchBlob.fs.unlink(folder) to kill all there

export function useCachedEncryptedFile(props, ldat){
  const {meme} = useStores()
  const {id, media_key, media_type, media_token} = props

  const [data, setData] = useState('')
  const [uri, setURI] = useState('')
  const [loading, setLoading] = useState(false)

  function dispose(){
    RNFetchBlob.session(sess).dispose().then(() => { 
      console.log(`${sess} disposed`)  
    })
  }

  async function trigger() {
    if(loading||data||uri) return // already done
    if(!(ldat&&ldat.host)) {
      return
    }
    if(!ldat.sig){
      return
    }

    setLoading(true)
    console.log("TRIGGER IT!!!")

    // if img already exists return it
    const existingPath = dirs.CacheDir + `/attachments/msg_${id}_decrypted`
    const exists = await RNFetchBlob.fs.exists(existingPath)
    if(exists) {
      setURI('file://'+existingPath)
      setLoading(false)
      return
    }

    const url = `https://${ldat.host}/file/${media_token}`
    const server = meme.servers.find(s=> s.host===ldat.host)
    if(!server) return 
    try {
      const res = await RNFetchBlob
      .config({
        path: dirs.CacheDir + `/attachments/msg_${id}`
      })
      .fetch('GET', url, {
        Authorization : `Bearer ${server.token}`,
      })
      console.log('The file saved to ', res.path())

      const path = res.path()
      const status = res.info().status
      if(status == 200 && path){
        let extension = ''
        if(media_type.startsWith('audio')){
          // extension = 'm4a'
        }
        const newpath = await aes.decryptFileAndSave(path, media_key, extension)
        setURI('file://'+newpath)
        setLoading(false)
      }
      // if(status == 200 && path){
      //   console.log("DECRYPT", path, media_key)
      //   const dec = await aes.readEncryptedFile(path, media_key)
      //   const dataURI = `data:${media_type};base64,${dec}`
      //   console.log('got data URI', dataURI.length)
      //   setData(dataURI)
      //   setLoading(false)
      // }

      // let status = res.info().status
      // if(status == 200) {
      //   let base64Str = res.base64() // native conversion
      //   console.log('dec w pwd',media_key)
      //   const dec = await aes.decryptToBase64(base64Str, media_key)
      //   const dataURI = `data:${media_type};base64,${dec}`
      //   console.log(`data:${media_type};base64,${dataURI.length}`)
      //   setImgData(dataURI)
      //   setLoading(false)
      // }
    } catch(e) {
      console.log(e)
    }
  }

  return {data,uri,loading,trigger,dispose}
}