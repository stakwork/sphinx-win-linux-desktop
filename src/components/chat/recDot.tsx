import React, { useEffect, useMemo } from 'react'
import {View, StyleSheet, Animated } from 'react-native'

const RecDot = React.memo(function(){
  const color = new Animated.Value(0);
  useEffect(()=>{
    Animated.loop(
      Animated.sequence([
        Animated.timing(color, {
          toValue: 100,
          duration: 800,
          useNativeDriver:false,
          isInteraction:false,
        }),
        Animated.timing(color, {
          toValue: 0,
          duration: 800,
          useNativeDriver:false,
          isInteraction:false,
        })
      ]),
      {iterations: 4}
    ).start()
  },[])
  const backgroundColor = color.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgb(250,0,0)', 'rgb(250, 200, 200)']
  })
  return <View style={{marginLeft:10}}>
    <Animated.View style={[
      styles.dot,
      {backgroundColor}
    ]} />
  </View>
})

export default RecDot

const styles = StyleSheet.create({
  dot:{
    borderRadius:10,
    height:20,width:20,
  }
})