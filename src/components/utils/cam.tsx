import React, {useState, useEffect, useRef} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {RNCamera} from 'react-native-camera'
import {Button} from 'react-native-paper'

export default function Cam({onCancel,onSnap}) {
  // const [hasPermission, setHasPermission] = useState(null)
  const [type, setType] = useState(RNCamera.Constants.Type.back)

  const camRef:any = useRef(null)

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Camera.requestPermissionsAsync()
  //     setHasPermission(status === 'granted')
  //   })()
  // }, [])

  async function takePic(){
    if(camRef && camRef.current) {
      const pic = await camRef.current.takePictureAsync({
        quality:0.5,
        // skipProcessing:true,
      })
      onSnap(pic)
    }
  }

  // if (hasPermission === false) {
  //   return <Text>No access to camera</Text>
  // }
  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={camRef}
        style={{flex:1}}
        type={type}
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
      />
      <View style={styles.toolbar}>
        <Button icon="cancel" onPress={()=>onCancel()} color="white">
          Cancel
        </Button>
        <Snapper snap={()=> takePic()}/>
        <Button icon="rotate-left" color="white"
          onPress={() => setType(
            type === RNCamera.Constants.Type.back
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          )}>Flip</Button>
      </View>
    </View>
  )
}

function Snapper({snap}){
  return <View style={styles.snapWrap}>
    <View style={styles.innerSnap}>
      <TouchableOpacity style={styles.snap} activeOpacity={0.5}
        onPress={()=>snap()}>
      </TouchableOpacity>
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  toolbar:{
    flex:1,
    flexDirection:'row',
    marginLeft:'5%',
    width:'90%',
    marginBottom:10,
    maxHeight:52,
    alignItems:'center',
    justifyContent:'space-between',
    position:'absolute',
    bottom:0,
    left:0,right:0,
  },
  snapWrap:{
    width:64,height:64,
    backgroundColor:'#ddd',
    borderRadius:32,
    marginBottom:48,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  innerSnap:{
    width:55,height:55,
    backgroundColor:'#333',
    borderRadius:35,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  snap:{
    width:50,height:50,
    backgroundColor:'#ddd',
    borderRadius:25,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
})