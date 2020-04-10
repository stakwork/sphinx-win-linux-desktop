import React from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import {RNCamera} from 'react-native-camera'

export default function Scanner(props){
  const {handleBarCodeScanned,height,scanned} = props
  let w = Dimensions.get('screen').width
  let h = height || Dimensions.get('screen').height-130
  if(w===0) w=280

  return <View style={styles.scannerWrap}>
    <RNCamera
      style={{flex:1}}
      type={RNCamera.Constants.Type.back}
      flashMode={RNCamera.Constants.FlashMode.off}
      androidCameraPermissionOptions={{
        title: 'Permission to use camera',
        message: 'We need your permission to use your camera',
        buttonPositive: 'Ok',
        buttonNegative: 'Cancel',
      }}
      onGoogleVisionBarcodesDetected={({ barcodes }) => {
        if(!scanned){
          const qr = barcodes[0]
          handleBarCodeScanned(qr)
        }
      }}
      googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}
    />
    <Outliner size={w-80} top={h/2-(w/2-40)} />
  </View>
}

const outlines=[
  {top:0,left:0,height:50,width:3},
  {top:0,left:0,height:3,width:50},
  {top:0,right:0,height:50,width:3},
  {top:0,right:0,height:3,width:50},
  {bottom:0,right:0,height:50,width:3},
  {bottom:0,right:0,height:3,width:50},
  {bottom:0,left:0,height:50,width:3},
  {bottom:0,left:0,height:3,width:50},
]
function Outliner({size,top}){
  return <View style={{...styles.outlineWrap,width:size,height:size,top}}>
    {outlines.map((o,i)=>{
      return <View key={i} style={{position:'absolute',backgroundColor:'white',...o}} />
    })}
  </View>
}

const styles = StyleSheet.create({
  scannerWrap:{
    flex:1,
    backgroundColor:'black',
    maxHeight:'100%',
    maxWidth:'100%',
    flexDirection:'column',
    justifyContent:'center'
  },
  outlineWrap:{
    left:40,
    position:'absolute',
  }
})