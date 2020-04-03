import React, {useState, useEffect} from 'react'
import {Dialog, Portal, TextInput, Button} from 'react-native-paper'
import {View, Text, TouchableWithoutFeedback, Image, TouchableOpacity} from 'react-native'
import {inputStyles} from './shared'
import Icon from 'react-native-vector-icons/AntDesign'
import Cam from '../../utils/cam'
import ImgSrcDialog from '../../utils/imgSrcDialog'

export default function PhotoInput({name,label,required,setValue,value}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)

  function tookPic(uri){
    setDialogOpen(false)
    setTakingPhoto(false)
    setValue(uri)
  }
  
  const imgURI = value
  const hasImgURI = imgURI?true:false
  return <View style={{...inputStyles, ...styles.wrap}}>
    <TouchableWithoutFeedback onPress={() => setDialogOpen(true)}>
      <View style={styles.box}>
        <Text style={styles.label}>
          {`${label.en}${required?' *':''}`}
        </Text>
      </View>
    </TouchableWithoutFeedback>
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