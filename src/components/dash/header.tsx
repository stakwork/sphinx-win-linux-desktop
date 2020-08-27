import React from 'react'
import {View, Text, StyleSheet, ToastAndroid} from 'react-native'
import { Appbar } from 'react-native-paper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import {useStores} from '../../store'
import { useObserver } from 'mobx-react-lite'

export default function Header() {
  const navigation = useNavigation()
  const {details, ui} = useStores()

  const checkConnectionHandler = () => {
    const connected = ui.connected ? 'Connected node' : 'Disconnected node';
    ToastAndroid.showWithGravity(
      `${connected}`,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  }

  return useObserver(()=>
    <Appbar.Header dark={false} style={{width:'100%',backgroundColor:'#6289FD', flexDirection: 'row'}}>
      <FontAwesome style={{marginLeft: 10}} name="bars" color="#FFF" size={20} onPress={()=>{
        navigation.dispatch(DrawerActions.openDrawer())
      }} />
      <View style={styles.topWrap}>
        <Text style={styles.amt}>{details.balance}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
      <FontAwesome style={styles.bolt} name="bolt" color="#FFF" size={20} onPress={checkConnectionHandler} />
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
  },
  bolt: {
    position: 'absolute',
    top: 20,
    left: 380
  }
})
