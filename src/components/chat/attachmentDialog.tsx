import React from 'react'
import {Portal, Button, Dialog} from 'react-native-paper'
import ImagePicker from 'react-native-image-picker'

export default function AttachmentDialog({open, onClose, onPick, onChooseCam, doPaidMessage, hidePaidMessage}){
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
      <Dialog.Title>File Attachment</Dialog.Title>
      <Dialog.Actions style={{
        height:160,
        display:'flex',flexDirection:'column',
        justifyContent:'space-between',alignItems:'flex-start'
        }}>
        <Button icon="camera" onPress={()=>onChooseCam()} style={{width:'100%',alignItems:'flex-start'}}>
          Camera
        </Button>
        <Button icon="image" onPress={()=>pickImage()} style={{width:'100%',alignItems:'flex-start'}}>
          Photo Library
        </Button>
        {!hidePaidMessage && <Button icon="message" onPress={()=>doPaidMessage()} style={{width:'100%',alignItems:'flex-start'}}>
          Paid Message
        </Button>}
      </Dialog.Actions>
    </Dialog>
  </Portal>
}
