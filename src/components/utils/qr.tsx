import React, { useState,useEffect } from 'react'
import { StyleSheet, View, BackHandler } from 'react-native'
import Header from '../modals/modalHeader'
import Scanner from './scanner'
import {TextInput,Button} from 'react-native-paper'

export default function QR({onCancel,onScan,showPaster}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [text,setText] = useState('')

  useEffect(()=>{
    BackHandler.addEventListener('hardwareBackPress', function() {
      onCancel()
      return true
    })
  },[])

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
        smaller
      />
      {showPaster && <View style={styles.bottom}>
        <View style={styles.textInputWrap}>
          <TextInput value={text} onChangeText={e=>setText(e)} 
            label="Paste invoice or Sphinx code"
            mode="outlined"
          />
        </View>
        <View style={styles.confirmWrap}>
          {(text?true:false) && <Button style={styles.confirm}
            onPress={()=> handleBarCodeScanned({
              data:text,type:'text'
            })}
            mode="contained" dark={true}>
            CONFIRM
          </Button>}
        </View>
      </View>}
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
    backgroundColor:'black'
  },
  bottom:{
    width:'100%',
    height:153,
    backgroundColor:'white'
  },
  textInputWrap:{
    marginLeft:20,
    marginRight:20,
    marginTop:20,
    marginBottom:15,
  },
  confirmWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    height:50,
  },
  confirm:{
    backgroundColor:'#6289FD',
    height:35,
    width:150,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },
})