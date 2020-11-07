import React, {useState} from 'react'
import {Text, ActivityIndicator} from 'react-native'
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
    loopout,
    isConversation,
    onGiphyHandler,
    hasLoopout,
  }) {

  const [fetchingGifs,setFetchingGifs] = useState(false)

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
  const loopoutHandler = () => loopout()
  const pickGif = async () => {
    setFetchingGifs(true)
    await onGiphyHandler()
    setFetchingGifs(false)
  }

  let height = isConversation ? 280 : 180
  if(hasLoopout) height+=80
  return <Portal>
    <Dialog visible={open} style={{ bottom: 10 }}
      onDismiss={onCloseHandler}>
      <Dialog.Title>Message Options</Dialog.Title>
      <Dialog.Actions style={{
        height,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <Button icon="camera" onPress={onChooseCamHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-camera-button">
          Camera
        </Button>
        <Button icon="image" onPress={pickImageHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-photo-button">
          Photo Library
        </Button>
        <Button icon="gif" onPress={pickGif} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-gif-button"
          loading={fetchingGifs}>
          Gif
        </Button>
        <Button icon="message" onPress={doPaidMessageHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-paid-msg-button">
          Paid Message
        </Button>
        {isConversation && <Button icon="arrow-bottom-left" onPress={requestHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-request-button">
          Request
        </Button>}
        {isConversation && <Button icon="arrow-top-right" onPress={sendHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-send-button">
          Send
        </Button>}
        {hasLoopout && <Button icon="arrow-top-right" onPress={loopoutHandler} style={{ width: '100%', alignItems: 'flex-start' }} accessibilityLabel="dialog-loopout-button">
          Send OnChain  
        </Button>}
      </Dialog.Actions>
    </Dialog>
  </Portal>
}
