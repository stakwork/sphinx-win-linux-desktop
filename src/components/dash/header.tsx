import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { Appbar } from 'react-native-paper'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import {useStores} from '../../store'
import { useObserver } from 'mobx-react-lite'

export default function Header() {
  const navigation = useNavigation()
  const {details} = useStores()
  return useObserver(()=>
    <Appbar.Header dark={true} style={{width:'100%',backgroundColor:'#6289FD'}}>
      <Appbar.Action icon="menu" onPress={()=>{
        navigation.dispatch(DrawerActions.openDrawer())
      }} />
      <View style={styles.topWrap}>
        <Text style={styles.amt}>{details.balance}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
    </Appbar.Header>
  )
}

const styles=StyleSheet.create({
  topWrap:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row',
    width:'100%',
    position:'absolute',
    left:0,right:0,top:0,bottom:0,
  },
  amt:{
    color:'white'
  },
  sat:{
    color:'#ccc',
    marginLeft:15
  }
})
