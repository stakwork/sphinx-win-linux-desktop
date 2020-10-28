import React, {useRef} from 'react'
import {Animated, Easing, StyleSheet, View, Text} from 'react-native'
import {useTheme} from '../../../store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {TouchableRipple} from 'react-native-paper'

export default function Boost({style,onPress}){
  const theme = useTheme()
  const size = useRef(new Animated.Value(1)).current;
  function go(){
    Animated.sequence([
      Animated.timing(size, {
        toValue: 2.5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(size, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    onPress()
  }
  return <TouchableRipple borderless style={{...styles.ripple,...style}} 
    onPress={go} rippleColor={theme.accent} underlayColor="black">
    <View style={{...styles.wrap,backgroundColor:theme.accent}}>
      <Text style={styles.hundred}>100</Text>
      <Animated.View style={{
        ...styles.rocketWrap,
        transform:[{scale:size}]
      }}>
        <Icon color={theme.accent} size={20} name="rocket-launch" /> 
      </Animated.View>
    </View>
  </TouchableRipple>
}

const styles = StyleSheet.create({
  ripple:{
    height:72,
    width:120,
    borderRadius:36,
    position:'relative'
  },
  wrap:{
    height:38,
    width:86,
    borderRadius:19,
    position:'absolute',
    left:17,top:17
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
