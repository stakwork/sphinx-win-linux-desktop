import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Image, View, Linking } from 'react-native'
import shared from './sharedStyles'
import RNUrlPreview from 'react-native-url-preview';
import { useParsedGiphyMsg } from '../../../store/hooks/msg'
import {useTheme} from '../../../store'
import ClipMessage from './clipMsg'
import BoostMessage from './boostMsg'
import BoostRow from './boostRow'
import TribeMsg from './tribeMsg'

export default function TextMsg(props) {
  const theme = useTheme()
  const { message_content } = props
  const isLink = message_content && (message_content.toLowerCase().startsWith('http://') || message_content.toLowerCase().startsWith('https://'))

  function openLink(){
    Linking.openURL(message_content)
  }

  const showBoostRow = props.boosts_total_sats?true:false

  const isGiphy = message_content && message_content.startsWith('giphy::')
  if (isGiphy) {
    const { url, aspectRatio, text } = useParsedGiphyMsg(message_content)
    return <View style={{...styles.column, maxWidth:200}}>
      <Image source={{ uri: url }}
        style={{ width: 200, height: 200 / (aspectRatio||1) }} 
        resizeMode={'cover'}
      />
      {(text?true:false) && <Text style={{...styles.textPad,color:theme.title}}>{text}</Text>}
      {showBoostRow && <BoostRow {...props} myAlias={props.myAlias} pad marginTop={14} />}
    </View>
  }

  const isClip = message_content && message_content.startsWith('clip::')
  if(isClip) {
    return <View style={styles.column}>
      <ClipMessage {...props} />
      {showBoostRow && <BoostRow {...props} myAlias={props.myAlias} pad marginTop={8} />}
    </View>
  }
  const isBoost = message_content && message_content.startsWith('boost::')
  if(isBoost) {
    return <BoostMessage {...props} />
  }

  const isTribe = message_content &&
  message_content.startsWith('sphinx.chat://?action=tribe')
  if(isTribe) {
    return <TribeMsg {...props} />
  }

  const onLongPressHandler = () => props.onLongPress(props)
  
  return <TouchableOpacity style={isLink ? { width: 280, paddingLeft: 7, minHeight: 72 } : shared.innerPad}
    onLongPress={onLongPressHandler}>
    {isLink ? <View style={styles.linkWrap}>
      <TouchableOpacity onPress={openLink}>
        <Text style={styles.link}>{message_content}</Text>
      </TouchableOpacity>
      <RNUrlPreview {...linkStyles(theme)}
        text={message_content}
      /> 
    </View> :
    <Text style={{...styles.text,color:theme.title}}>{message_content}</Text>}
    {showBoostRow && <BoostRow {...props} myAlias={props.myAlias} marginTop={8} />}
  </TouchableOpacity>
}

function linkStyles(theme) {
  return {
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
      color: theme.title,
      marginRight: 10,
      marginBottom: 5,
      alignSelf: "flex-start",
      fontFamily: "Helvetica"
    },
    descriptionStyle: {
      fontSize: 11,
      color: theme.subtitle, //"#81848A",
      marginRight: 10,
      alignSelf: "flex-start",
      fontFamily: "Helvetica"
    },
  }
}

const styles = StyleSheet.create({
  linkWrap:{
    display:'flex'
  },
  link:{
    padding:10,
    color:'#6289FD',
  },
  text: {
    fontSize: 16,
  },
  column: {
    display:'flex',
    maxWidth:'100%',
  },
  textPad: {
    color: '#333',
    fontSize: 16,
    paddingTop:10,
    paddingBottom:10,
    paddingLeft:12,
    paddingRight:12
  },
  littleTitle:{
    fontSize: 11,
    paddingTop:10,
    paddingLeft:12,
    paddingRight:12
  }
})