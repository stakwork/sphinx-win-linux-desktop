import React, { useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useParsedJsonOrClipMsg } from '../../../store/hooks/msg'
import { useTheme } from '../../../store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomIcon from '../../utils/customIcons'

export default function BoostMessage(props) {
  const theme = useTheme()
  const { message_content } = props

  const obj = useParsedJsonOrClipMsg(message_content)
  const { ts, feedID, itemID, amount } = obj

  return <View style={{ ...styles.pad }}>
    <View style={{...styles.rocketWrap, backgroundColor:theme.accent}}>
      <CustomIcon color="white" size={20} name="fireworks" />
    </View>
    <Text style={{ color: theme.title, fontWeight:'bold' }}>
      {amount}
    </Text>
    <Text style={{ color: theme.title, opacity:0.5, marginLeft:6 }}>
      sat
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