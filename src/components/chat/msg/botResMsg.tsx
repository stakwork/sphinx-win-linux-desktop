import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native'
import shared from './sharedStyles'
import HTML from "react-native-render-html";
import {useTheme} from '../../../store'

function makeHTML(html, theme){
  const color = theme.title
  return `<div style="color:${color};">${html}</div>`
}

export default function TextMsg(props) {
  const theme = useTheme()
  const { message_content } = props
  const onLongPressHandler = () => props.onLongPress(props)

  return <TouchableOpacity style={shared.innerPad}
    onLongPress={onLongPressHandler}>
    <HTML html={makeHTML(message_content, theme)}
      // imagesMaxWidth={Dimensions.get("window").width}
    />
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