import React from 'react'
import {View,StyleSheet,Image} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'
import RadialGradient from 'react-native-radial-gradient'

export default function Loading(){
  return <View style={styles.wrap}>
    <RadialGradient style={styles.gradient}
      colors={['#A68CFF','#6A8FFF']}
      stops={[0.1,1]}
      center={[80,40]}
      radius={400}>
      <Image source={require('../../android_assets/sphinx-white-logo.png')} 
        style={{width:120,height:120}} resizeMode={'cover'}
      />
      <View style={styles.spinWrap}>
        <ActivityIndicator animating={true} color="white" />
      </View>
    </RadialGradient>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
  },
  gradient:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  spinWrap:{
    height:20,
    marginTop:133,
    marginBottom:150
  },
})