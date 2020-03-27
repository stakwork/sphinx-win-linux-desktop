import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, StyleSheet, Image,Dimensions} from 'react-native'
import {IconButton} from 'react-native-paper'

export default function ImgViewer(props) {
  const {data,uri} = props
  const { ui } = useStores()
  const w = Math.round(Dimensions.get('window').width)
  const showImg = (uri||data)?true:false
  return useObserver(() =>
    <View style={styles.wrap}>
      <IconButton
        icon="arrow-left"
        color="white"
        size={27}
        style={styles.back}
        onPress={() => {
          ui.setImgData('')
          ui.setImgURI('')
        }}
      />
      {showImg && <Image resizeMode='cover' source={{uri:uri||data}}
        style={{...styles.img,width:w,height:w*1.35}} 
      />}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    flexDirection:'column',
    justifyContent:'center',
    backgroundColor:'black'
  },
  back:{
    position:'absolute',
    left:4,top:31
  },
  img:{
    height:'80%',
    width:'100%'
  }
})