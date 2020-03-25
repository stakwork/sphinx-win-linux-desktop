import React, {useState, useEffect, useRef} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {Camera} from 'expo-camera'
import {Button} from 'react-native-paper'

export default function Cam({onCancel,onSnap}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [type, setType] = useState(Camera.Constants.Type.back)

  const camRef:any = useRef(null)

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  async function takePic(){
    if(camRef && camRef.current) {
      const pic = await camRef.current.takePictureAsync()
      onSnap(pic)
    }
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type}
        ref={camRef}>
        <View style={styles.wrap}>
          <View style={styles.toolbar}>
            <Button icon="cancel" onPress={()=>onCancel()} color="white">
              Cancel
            </Button>
            <Snapper snap={()=> takePic()}/>
            <Button icon="rotate-left" color="white"
              onPress={() => setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )}>Flip</Button>
          </View>
        </View>
      </Camera>
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
  }
})