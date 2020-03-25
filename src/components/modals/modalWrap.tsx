import React from 'react'
import {View, StyleSheet} from 'react-native'
import Modal from 'react-native-modal'

export default function Wrap({visible,onClose,children}) {
  return <Modal isVisible={visible} coverScreen={true} 
    onSwipeComplete={()=>onClose()} style={styles.modal}
    swipeDirection="down" swipeThreshold={20}>
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
    width:'100%'
  },
})
