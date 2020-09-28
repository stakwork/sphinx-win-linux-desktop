import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native'
import shared from './sharedStyles'
import RNUrlPreview from 'react-native-url-preview';
import { useParsedGiphyMsg } from '../../../store/hooks/msg'

export default function TextMsg(props) {
  const { message_content } = props
  const isLink = message_content && (message_content.toLowerCase().startsWith('http://') || message_content.toLowerCase().startsWith('https://'))

  const isGiphy = message_content && message_content.startsWith('giphy::')
  if (isGiphy) {
    const { url, aspectRatio } = useParsedGiphyMsg(message_content)
    return <Image source={{ uri: url }}
      style={{ width: 120 * (aspectRatio || 1), height: 120 }} resizeMode={'cover'}
    />
  }
  const onLongPressHandler = () => props.onLongPress(props)
  return <TouchableOpacity style={isLink ? { width: 280, paddingLeft: 7, minHeight: 72 } : shared.innerPad}
    onLongPress={onLongPressHandler}>
    {isLink ? <RNUrlPreview {...linkStyles}
      text={message_content}
    /> :
      <Text style={styles.text}>{message_content}</Text>}
  </TouchableOpacity>
}

const linkStyles = {
  containerStyle: {
    alignItems: "center",
  },
  imageStyle: {
    width: 80, height: 80,
    paddingRight: 10,
    paddingLeft: 10
  },
  titleStyle: {
    fontSize: 14,
    color: "#000",
    marginRight: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
    fontFamily: "Helvetica"
  },
  descriptionStyle: {
    fontSize: 11,
    color: "#81848A",
    marginRight: 10,
    alignSelf: "flex-start",
    fontFamily: "Helvetica"
  },
}

const styles = StyleSheet.create({
  text: {
    color: '#333',
    fontSize: 16,
  },
})