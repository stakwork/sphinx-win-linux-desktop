import React from 'react'
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native'
import {useTheme} from '../../../store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function Boost({style,onPress}){
  const theme = useTheme()
  return <TouchableOpacity style={{...styles.wrap,...style,backgroundColor:theme.accent}} onPress={onPress}>
    <Text style={styles.hundred}>100</Text>
    <View style={styles.rocketWrap}>
      <Icon color={theme.accent} size={20} name="rocket-launch" /> 
    </View>
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  wrap:{
    height:38,
    width:86,
    borderRadius:19,
    position:'relative'
  },
  rocketWrap:{
    height:30,width:30,
    backgroundColor:'white',
    borderRadius:15,
    position:'absolute',
    right:4,
    top:4,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  hundred:{
    color:'white',
    fontSize:15,
    fontWeight:'bold',
    position:'absolute',
    top:8,left:14
  }
})
