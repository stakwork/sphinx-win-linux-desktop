import React from 'react'
import {View,Text,StyleSheet} from 'react-native'
import {IconButton} from 'react-native-paper'

export default function Header(props){
  const {title,onClose} = props
  return <View style={{...styles.header, ...props.background&&{backgroundColor:props.background}}}>
    <View style={styles.headerLefty}></View>
    <Text style={styles.headerTitle}>{title}</Text>
    <IconButton
      icon="close"
      color="#DB5554"
      size={22}
      style={{marginRight:14,marginTop:8}}
      onPress={() => onClose()}
    />
  </View>
}

const styles = StyleSheet.create({
  header:{
    height:50,
    minHeight:50,
    width:'100%',
    paddingLeft:0,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  headerTitle:{
    fontWeight:'bold',
    fontSize:16
  },
  headerLefty:{
    backgroundColor:'white',
    width:51,height:1,
  },
})
