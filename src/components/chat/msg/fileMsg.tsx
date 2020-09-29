import React from 'react'
import { ToastAndroid, Text, StyleSheet, View } from 'react-native'
import shared from './sharedStyles'
import {IconButton} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import RNFetchBlob from 'rn-fetch-blob'

let dirs = RNFetchBlob.fs.dirs

export default function FileMsg(props) {
  const { filename, uri } = props
  async function download(){
    console.log(uri, dirs.DownloadDir+'/'+filename)
    await RNFetchBlob.fs.cp(uri, dirs.DownloadDir+'/'+filename)
    ToastAndroid.showWithGravityAndOffset(
      'File Downloaded',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
      0, 125
    );
  }
  return <View style={{...shared.innerPad,...styles.wrap}}>
    <Icon name="file" color="grey" size={27} />
    <Text style={styles.filename}>{filename||'file'}</Text>
    <IconButton icon="download" color="grey" size={27} 
      onPress={download}
    />
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  text: {
    color: '#333',
    fontSize: 16,
  },
  filename:{
    color:'grey',
    marginLeft:12,
    marginRight:12,
    maxWidth:75
  }
})