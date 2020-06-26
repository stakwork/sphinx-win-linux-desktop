import React from 'react'
import {TouchableOpacity, Text, StyleSheet} from 'react-native'
import shared from './sharedStyles'
import RNUrlPreview from 'react-native-url-preview';

export default function TextMsg(props){
  const {message_content} = props  
  const isLink = message_content && (message_content.toLowerCase().startsWith('http://') || message_content.toLowerCase().startsWith('https://'))
  return <>
    <TouchableOpacity style={isLink?{width:280,paddingLeft:7,minHeight:72}:shared.innerPad}
      onLongPress={()=>props.onLongPress(props)}>
      {isLink ? <RNUrlPreview {...linkStyles} 
        text={message_content}
      /> : 
      <Text style={styles.text}>{message_content}</Text>}
    </TouchableOpacity>
  </>
}

const linkStyles = {
  containerStyle:{
    alignItems: "center",
  },
  imageStyle:{
    width:80,height:80,
    paddingRight: 10,
    paddingLeft: 10
  },
  titleStyle:{
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
  text:{
    color:'#333',
    fontSize:16,
  },
})