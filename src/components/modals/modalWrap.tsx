import React,{useEffect} from 'react'
import {View, StyleSheet, Dimensions} from 'react-native'
import Modal from 'react-native-modal'

export default function Wrap(props) {
  const {visible,onClose,children,noSwipe} = props
  return <Modal isVisible={visible} 
    style={styles.modal}
    onSwipeComplete={()=>onClose()} 
    swipeDirection={noSwipe?null:'down'} 
    onBackButtonPress={()=>onClose()}
    useNativeDriver={true}
    coverScreen={true}
    // statusBarTranslucent={true}
    // deviceHeight={Dimensions.get('screen').height-142}
    propagateSwipe={props.propagateSwipe?true:false}
    swipeThreshold={20}>
    {visible ? <View style={styles.main}>
      {children}
    </View> : <View />}
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
