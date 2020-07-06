import React from 'react'
import {Portal, Button, Dialog} from 'react-native-paper'

export default function ConfirmDialog({open, onClose, onConfirm}){
  return <Portal>
    <Dialog visible={open} style={{bottom:10}}
      onDismiss={()=> onClose()}>
      <Dialog.Title>Are you sure?</Dialog.Title>
      <Dialog.Actions style={{justifyContent:'space-between'}}>
        <Button icon="cancel" onPress={()=>onClose()} color="grey">
          Cancel
        </Button>
        <Button icon="check" onPress={()=>onConfirm()}>
          Confirm
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
}