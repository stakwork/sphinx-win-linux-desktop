import React from 'react'
import {Portal, Button, Dialog} from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'

export default function ImgSrcDialog({open, onClose, onPick, onChooseCam}){
  async function pickImage() {
    let result:{[k:string]:any} = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1
    })
    if (result && !result.cancelled) {
      onPick(result)
    } else {
      onClose()
    }
  }
  return <Portal>
    <Dialog visible={open} style={{bottom:10}}
      onDismiss={()=> onClose()}>
      <Dialog.Title>Choose Image Source</Dialog.Title>
      <Dialog.Actions style={{justifyContent:'space-between'}}>
        <Button icon="camera" onPress={()=>onChooseCam()}>
          Camera
        </Button>
        <Button icon="image" onPress={()=>pickImage()}>
          Photo Library
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
}