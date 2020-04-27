import React from 'react'
import {View, StyleSheet} from 'react-native'
import Modal from 'react-native-modal'

export default function Wrap(props) {
  const {visible,onClose,children,noSwipe} = props

  return <Modal isVisible={visible} 
    coverScreen={true} style={styles.modal}
    onSwipeComplete={()=>onClose()} 
    swipeDirection={noSwipe?null:'down'} 
    onBackButtonPress={()=>onClose()}
    // deviceHeight={Dimensions.get('screen').height}
    swipeThreshold={20}>
    <View style={styles.main}>
      {children}
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
    flex:1,
  },
  main:{
    backgroundColor:'white',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    marginTop:5,
    flex:1,
    width:'100%',
    height:'100%',
  },
})
