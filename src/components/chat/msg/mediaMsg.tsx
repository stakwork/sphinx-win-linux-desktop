import React, {useEffect} from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {parseLDAT} from '../../utils/ldat'
import RNFetchBlob from 'rn-fetch-blob'
import {useStores} from '../../../store'
import * as aes from '../../../crypto/aes'

export default function MediaMsg(props){
  console.log(props)
  const {meme} = useStores()

  const {message_content, media_token, media_key, media_type} = props

  useEffect(()=>{
    const ldat = parseLDAT(media_token)
    if(!(ldat && ldat.host)) return

    const url = `https://${ldat.host}/file/${media_token}`
    console.log(url)
    const server = meme.servers.find(s=> s.host===ldat.host)
    console.log("server",server)
    if(!server) return 

    return
    RNFetchBlob.fetch('GET', url, {
      Authorization : `Bearer ${server.token}`,
    })
    .then(async (res) => {
      let status = res.info().status;

      if(status == 200) {
        // the conversion is done in native code
        let base64Str = res.base64()
        // console.log(base64Str)

        const dec = await aes.decrypt(base64Str, media_key)
        console.log(dec)

        const reader = new FileReader()
        reader.onloadend = () => {
          console.log("RESULT",reader.result)
        }
        reader.readAsDataURL(new Blob([dec], {type:media_type}))
        // the following conversions are done in js, it's SYNC
        // let text = res.text()
        // let json = res.json()
      } else {
        // handle other status codes
      }
    })
    // Something went wrong:
    .catch((errorMessage) => {
      // error handling
      console.log(errorMessage)
    })
  },[])

  return <View>
    <Text style={styles.text}>{message_content}</Text>
  </View>
}

const styles = StyleSheet.create({
  text:{
    color:'#333',
    fontSize:16,
  },
})