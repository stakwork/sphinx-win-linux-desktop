import React from 'react'
import {View,Text,StyleSheet} from 'react-native'
import {IconButton} from 'react-native-paper'
import { useTheme } from '../../store'

export default function Header(props){
  const {title,onClose,leftArrow} = props
  const theme = useTheme()
  return <View style={{...styles.header, ...props.background&&{backgroundColor:props.background}}}>
    <View style={styles.headerLefty}>
      {leftArrow && <IconButton
        icon="arrow-left"
        color="grey"
        size={22}
        style={{marginRight:14,marginTop:8}}
        onPress={() => onClose()}
      />}
    </View>
    <Text style={{...styles.headerTitle,color:theme.title}}>{title}</Text>
    <View style={styles.headerLefty}>
      {!leftArrow && <IconButton
        icon="close"
        color="#DB5554"
        size={22}
        style={{marginRight:14,marginTop:8}}
        onPress={() => onClose()}
      />}
    </View>
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
    width:51,height:50,
    borderRadius:18,
    marginLeft:5
  },
})
