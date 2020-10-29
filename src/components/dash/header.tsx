import React from 'react'
import {View, Text, StyleSheet, TouchableHighlight, ToastAndroid} from 'react-native'
import { Appbar, IconButton } from 'react-native-paper'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import {useStores} from '../../store'
import { useObserver } from 'mobx-react-lite'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {ActivityIndicator} from 'react-native-paper'

export default function Header() {
  const navigation = useNavigation()
  const {details,ui} = useStores()

  const showStatusHandler = () => {
    const status = ui.connected ? 'Connected node' : 'Disconnected node'

    ToastAndroid.showWithGravityAndOffset(
      status,
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
      0, 125
    );
  };

  return useObserver(()=> {
    return <Appbar.Header dark={true} style={{width:'100%',backgroundColor:'#6289FD',display:'flex',position:'relative'}}>
      <IconButton icon="menu" accessibilityLabel="menu-button" onPress={()=>{
        navigation.dispatch(DrawerActions.openDrawer())
      }} style={styles.menuButton} color="white" />
      <View style={styles.topWrap} accessibilityLabel="appbar-top">
        <Text style={styles.amt}>{details.balance}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
      {ui.loadingHistory ?
        <ActivityIndicator animating={true} color="white" size={18} style={{position:'absolute',right:15}} /> :
        <TouchableHighlight onPress={showStatusHandler} style={styles.status}>
          <Icon
            name="flash"
            size={18}
            color={ui.connected ? '#49ca97' : '#febd59'}
          />
        </TouchableHighlight>
      }
    </Appbar.Header>
  })
}

const styles=StyleSheet.create({
  menuButton:{
    position:'absolute',
    left:10,
    zIndex:101,
  },
  topWrap:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row',
    width:'100%',
    position:'absolute',
    left:0,right:0,top:0,bottom:0,
    zIndex:100,
  },
  amt:{
    color:'white'
  },
  sat:{
    color:'#ccc',
    marginLeft:15
  },
  status:{
    position:'absolute',
    right:15,
    height:18,width:18,
    zIndex:101
  }
})
