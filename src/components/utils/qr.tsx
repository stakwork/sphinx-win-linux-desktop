import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import Header from '../modals/modalHeader'
import {RNCamera} from 'react-native-camera'

export default function QR({onCancel,onScan}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  const camRef:any = useRef(null)

  // useEffect(() => {
  //   (async () => {
  //     if(!hasPermission){
  //       const { status } = await BarCodeScanner.requestPermissionsAsync()
  //       if(status==='granted'){
  //         setHasPermission(true)
  //       } else {
  //         onCancel()
  //       }
  //     }
  //   })()
  // }, [])

  function handleBarCodeScanned({ type, data }) {
    setScanned(true)
    onScan(data)
  }

  let w = Dimensions.get('screen').width
  let h = Dimensions.get('screen').height
  if(w===0) w=280
  return (
    <View style={styles.wrap}>
      <Header title="Scan QR Code" onClose={()=>onCancel()} 
        background="white"
      />
      <View style={{...styles.scannerWrap}}>
        <RNCamera
          ref={camRef}
          style={{flex:1}}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          // androidRecordAudioPermissionOptions={{
          //   title: 'Permission to use audio recording',
          //   message: 'We need your permission to use your audio',
          //   buttonPositive: 'Ok',
          //   buttonNegative: 'Cancel',
          // }}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            const qr = barcodes[0]
            handleBarCodeScanned(qr)
          }}
          googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}
        />
        <Outliner size={w-80} top={h/2-200} />
      </View>
    </View>
  )
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
  wrap:{
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    position:'relative',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    overflow:'hidden',
    width:'100%',
  },
  scannerWrap:{
    flex:1,
    backgroundColor:'black',
  },
  outlineWrap:{
    left:40,
    position:'absolute',
  }
})