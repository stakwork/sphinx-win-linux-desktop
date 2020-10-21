import React, {useState, useEffect} from 'react'
import {Dialog, Portal, TextInput, ActivityIndicator} from 'react-native-paper'
import {View, Text, TouchableWithoutFeedback, Image, TouchableOpacity} from 'react-native'
import {inputStyles} from './shared'
import Icon from 'react-native-vector-icons/AntDesign'
import Cam from '../../utils/cam'
import ImgSrcDialog from '../../utils/imgSrcDialog'
import RNFetchBlob from 'rn-fetch-blob'
import { useStores } from '../../../store'

export default function PhotoURIInput({name,error,label,required,setValue,value,handleChange,handleBlur,accessibilityLabel}) {
  const { ui,meme,msg } = useStores()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPercent,setUploadedPercent] = useState(0)

  function tookPic(uri){
    setDialogOpen(false)
    setTakingPhoto(false)
    upload(uri)
  }

  async function upload(uri){
    if(uploading) return

    setUploading(true)

    const type = 'image/jpg'
    const name = 'Image.jpg'
    const server = meme.getDefaultServer()
    if(!server) return

    RNFetchBlob.fetch('POST', `https://${server.host}/public`, {
      Authorization: `Bearer ${server.token}`,
      'Content-Type': 'multipart/form-data'
    }, [{
        name:'file',
        filename:name,
        type: type,
        data: RNFetchBlob.wrap(uri)
      }, {name:'name', data:name}
    ])
    // listen to upload progress event, emit every 250ms
    .uploadProgress({ interval : 250 },(written, total) => {
        console.log('uploaded', written / total)
        setUploadedPercent(Math.round((written / total)*100))
    })
    .then(async (resp) => {
      let json = resp.json()
      if(json.muid){
        setValue(`https://${server.host}/public/${json.muid}`)
      }
      setUploading(false)
    })
    .catch((err) => {
       console.log(err)
    })
  }
  
  const imgURI = value
  const hasImgURI = imgURI?true:false

  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  return <View style={styles.wrap}>
    <TextInput
      accessibilityLabel={accessibilityLabel}
      spellCheck={false}
      autoCorrect={false}
      error={error}
      label={lab}
      style={{...inputStyles,paddingRight:45}}
      onChangeText={handleChange(name)}
      onBlur={handleBlur(name)}
      value={value}
    />
    <TouchableWithoutFeedback onPress={() => setDialogOpen(true)}>
      {uploading ? <ActivityIndicator animating={true} color="grey" size={20} 
        style={{ position:'absolute',right:10,top:20}}
      /> : <>
        {!hasImgURI && <Icon
          name="picture"
          color="#888"
          size={25}
          style={{position:'absolute',right:13,top:17}}
          onPress={() => setDialogOpen(true)}
        />}
        {hasImgURI && <Image source={{ uri: imgURI }} 
          style={{ width:52, height:52, position:'absolute',right:0,top:1, borderRadius:3 }}
        />}
      </>}
    </TouchableWithoutFeedback>

    <ImgSrcDialog 
      open={dialogOpen} onClose={()=>setDialogOpen(false)}
      onPick={res=> tookPic(res.uri)}
      onChooseCam={()=> setTakingPhoto(true)}
    />

    {takingPhoto && <Portal>
      <Cam onCancel={()=>setTakingPhoto(false)} 
        onSnap={pic=> tookPic(pic.uri)}
      />
    </Portal>}
  </View>
}

const styles={
  wrap:{
    flex:1,
  },
  box:{
    height:inputStyles.height,
    borderBottomColor:'#bbb',
    borderBottomWidth:1,
  },
  label:{
    fontSize:15,
    color:'#666',
    top:20,
    left:12
  }
}