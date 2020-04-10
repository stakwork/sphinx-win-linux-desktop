import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Header from '../modals/modalHeader'
import Scanner from './scanner'

export default function QR({onCancel,onScan}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

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

  return (
    <View style={styles.wrap}>
      <Header title="Scan QR Code" onClose={()=>onCancel()} 
        background="white"
      />
      <Scanner scanned={scanned?true:false}
        handleBarCodeScanned={handleBarCodeScanned}
      />
    </View>
  )
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
})