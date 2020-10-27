import React, { useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useParsedClipMsg } from '../../../store/hooks/msg'
import { useTheme } from '../../../store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function BoostMessage(props) {
  const theme = useTheme()
  const { message_content } = props

  const obj = useParsedClipMsg(message_content)
  const { ts, feedID, itemID, amount } = obj

  return <View style={{ ...styles.pad }}>
    <View style={{...styles.rocketWrap, backgroundColor:theme.accent}}>
      <Icon color="white" size={20} name="rocket-launch" />
    </View>
    <Text style={{ color: theme.title }}>
      Boost!
    </Text>
    <Text style={{ color: theme.title, fontWeight:'bold', marginLeft:5 }}>
      {amount}
    </Text>
  </View>
}

const styles = StyleSheet.create({
  pad: {
    color: '#333',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    minWidth:150,
  },
  rocketWrap:{
    height:30,width:30,
    backgroundColor:'white',
    borderRadius:15,
    position:'absolute',
    right:6,
    top:6,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
})