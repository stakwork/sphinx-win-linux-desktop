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

  const onCloseHandler = () => onClose()
  const onChooseCamHandler = () => onChooseCam()
  const pickImageHandler = () => pickImage()
  const doPaidMessageHandler = () => doPaidMessage()
  const requestHandler = () => request()
  const sendHandler = () => send()

  return <Portal>
    <Dialog visible={open} style={{ bottom: 10 }}
      onDismiss={onCloseHandler}>
      <Dialog.Title>Message Options</Dialog.Title>
      <Dialog.Actions style={{
        height: isConversation ? 260 : 160,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <Button icon="camera" onPress={onChooseCamHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Camera
        </Button>
        <Button icon="image" onPress={pickImageHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Photo Library
        </Button>
        <Button icon="gif" onPress={onGiphyHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Gif
        </Button>
        <Button icon="message" onPress={doPaidMessageHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Paid Message
        </Button>
        {isConversation && <Button icon="arrow-bottom-left" onPress={requestHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Request
        </Button>}
        {isConversation && <Button icon="arrow-top-right" onPress={sendHandler} style={{ width: '100%', alignItems: 'flex-start' }}>
          Send
        </Button>}
      </Dialog.Actions>
    </Dialog>
  </Portal>
}
