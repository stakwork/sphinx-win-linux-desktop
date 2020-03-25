import React, { useState, useEffect } from 'react'
import { Animated, Text, View } from 'react-native'

export default function FadeInView(props) {
  const [fadeAnim] = useState(new Animated.Value(0)) // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 10000,
    }).start()
  }, [])

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim, // Bind opacity to animated value
      }}>
      {props.children}
    </Animated.View>
  )
}