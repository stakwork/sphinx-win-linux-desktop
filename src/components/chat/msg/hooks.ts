import React, {useEffect, useState} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import {parseLDAT} from '../../utils/ldat'
import {useStores} from '../../../store'
import * as aes from '../../../crypto/aes'

export function useCachedEncryptedFile(props){
  const {meme} = useStores()
  const {media_token, media_key, media_type} = props

  const [imgData, setImgData] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async () => {
      const ldat = parseLDAT(media_token)
      if(!(ldat && ldat.host)) return
      const url = `https://${ldat.host}/file/${media_token}`
      const server = meme.servers.find(s=> s.host===ldat.host)
      if(!server) return 
      try {
        const res = await RNFetchBlob
        .config({fileCache:true})
        .fetch('GET', url, {
          Authorization : `Bearer ${server.token}`,
        })
        console.log('The file saved to ', res.path())
        const path = res.path()
        const status = res.info().status
        if(status == 200 && path){
          const dec = await aes.readEncryptedFile(path, media_key)
          const dataURI = `data:${media_type};base64,${dec}`
          console.log('got data URI', dataURI.length)
          setImgData(dataURI)
          setLoading(false)
        }
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
    })()
  }, [])

  return {imgData,loading}
}