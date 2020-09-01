import React from 'react'
import { Portal, Button, Dialog } from 'react-native-paper'
import ImagePicker from 'react-native-image-picker'

export default function AttachmentDialog({
    open,
    onClose,
    onPick,
    onChooseCam,
    doPaidMessage,
    request,
    send,
    isConversation,
    onGiphyHandler,
  }) {
  async function pickImage() {
    ImagePicker.launchImageLibrary({}, result => {
      if (!result.didCancel) {
        onPick(result)
      } else {
        onClose()
      }
    })
  }
  return <Portal>
    <Dialog visible={open} style={{ bottom: 10 }}
      onDismiss={() => onClose()}>
      <Dialog.Title>Message Options</Dialog.Title>
      <Dialog.Actions style={{
        height: isConversation ? 260 : 160,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <Button icon="camera" onPress={() => onChooseCam()} style={{ width: '100%', alignItems: 'flex-start' }}>
          Camera
        </Button>
        <Button icon="image" onPress={() => pickImage()} style={{ width: '100%', alignItems: 'flex-start' }}>
          Photo Library
        </Button>
        <Button icon="gif" onPress={onGiphyHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Gif
        </Button>
        <Button icon="message" onPress={() => doPaidMessage()} style={{ width: '100%', alignItems: 'flex-start' }}>
          Paid Message
        </Button>
        {isConversation && <Button icon="arrow-bottom-left" onPress={() => request()} style={{ width: '100%', alignItems: 'flex-start' }}>
          Request
        </Button>}
        {isConversation && <Button icon="arrow-top-right" onPress={() => send()} style={{ width: '100%', alignItems: 'flex-start' }}>
          Send
        </Button>}
      </Dialog.Actions>
    </Dialog>
  </Portal>
}
