import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import Header from '../modals/modalHeader'
import { BarCodeScanner } from 'expo-barcode-scanner'

export default function QR({onCancel,onScan}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    (async () => {
      if(!hasPermission){
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        if(status==='granted'){
          setHasPermission(true)
        } else {
          onCancel()
        }
      }
    })()
  }, [])

  function handleBarCodeScanned({ type, data }) {
    setScanned(true)
    onScan(data)
  }

  let w = Dimensions.get('screen').width
  if(w===0) w=280
  return (
    <View style={styles.wrap}>
      <Header title="Scan QR Code" onClose={()=>onCancel()} 
        background="white"
      />
      <View style={styles.scannerWrap}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Outliner size={w*0.74} />
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
function Outliner({size}){
  return <View style={{...styles.outlineWrap,width:size,height:size}}>
    {outlines.map((o,i)=>{
      return <View key={i} style={{position:'absolute',backgroundColor:'white',...o}} />
    })}
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    flexDirection:'column',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    overflow:'hidden',
    width:'100%'
  },
  scannerWrap:{
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
    backgroundColor:'black'
  },
  outlineWrap:{
    marginBottom:20,
    position:'relative',
  }
})