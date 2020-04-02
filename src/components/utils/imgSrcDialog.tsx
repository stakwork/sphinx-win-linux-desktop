import React from 'react'
import {Portal, Button, Dialog} from 'react-native-paper'
import ImagePicker from 'react-native-image-picker'

export default function ImgSrcDialog({open, onClose, onPick, onChooseCam}){
  async function pickImage() {
    ImagePicker.launchImageLibrary({}, result=>{
      if (!result.didCancel) {
        onPick(result)
      } else {
        onClose()
      }
    })
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