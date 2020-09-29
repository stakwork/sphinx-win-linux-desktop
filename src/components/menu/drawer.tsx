import React, {useState} from 'react'
import {StyleSheet, View, Text, Image, Dimensions} from 'react-native'
import {DrawerContentScrollView,DrawerItem} from '@react-navigation/drawer'
import {Title,Drawer,Button} from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useStores } from '../../store'
import { useObserver } from 'mobx-react-lite'
import {usePicSrc} from '../utils/picSrc'
import VERSION from '../../version'

const itemStyle = {height:60,paddingLeft:15}

export default function TheDrawer(props) {
  const {ui, details, user, contacts} = useStores()
  const me = contacts.contacts.find(c=> c.id===1)
  const uri = usePicSrc(me)
  const height = Math.round(Dimensions.get('window').height)
  const hasImg = uri?true:false
  const { navigation: { navigate } } = props
  const goToDashboardHandler = () => navigate('Dashboard')
  const goToContactsHandler = () => navigate('Contacts')
  const goToProfileHandler = () => navigate('Profile')
  const openAddFriendModalHandler = () => ui.setAddFriendModal(true)
  const openSupportModalHandler = () => ui.setSupportModal(true)
  return useObserver(() =>
    <DrawerContentScrollView {...props}>
      <View style={{height:height-52,...styles.wrap}}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={styles.userName}>
              <Image resizeMode="cover"
                source={hasImg?{uri}:require('../../../android_assets/avatar.png')}
                style={{width:50,height:50,borderRadius:25}}
              />
              <Title style={styles.title}>{user.alias}</Title>
            </View>
            <View style={styles.userBalance}>
              <Text style={{marginLeft:60}}>{details.balance}</Text>
              <Text style={{marginLeft:10,marginRight:10,color:'#c0c0c0'}}>sat</Text>
              <AntDesign name="wallet" color="#d0d0d0" size={20} />
            </View>
          </View>
        </View>
        <View style={styles.break}></View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <AntDesign name="message1" color={color} size={size} />
            )}
            label="Dashboard"
            onPress={goToDashboardHandler}
          />
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="account-multiple" color={color} size={size} />
            )}
            label="Contacts"
            onPress={goToContactsHandler}
          />
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="account" color={color} size={size} />
            )}
            label="Profile"
            onPress={goToProfileHandler}
          />
        </Drawer.Section>
        <Button icon="plus" mode="contained" dark={true}
          onPress={openAddFriendModalHandler}
          style={{backgroundColor:'#55D1A9',borderRadius:25,width:'60%',height:50,display:'flex',justifyContent:'center',marginLeft:20,marginTop:15}}>
          Add Friend
        </Button>
        <View style={styles.versionWrap}>
          <Text style={styles.versionWrap}>
            {`Version: ${VERSION}`}
          </Text>
        </View>
        <View style={styles.supportWrap}>
          <Button style={styles.supportButton} icon="email"
            onPress={openSupportModalHandler}>
            Support
          </Button>
        </View>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  wrap:{
    display:'flex',
    flexDirection:'column',
    justifyContent:'flex-start',
    position:'relative'
  },
  drawerContent: {
    paddingTop:25,
  },
  userInfoSection: {
    paddingLeft: 20,
    marginBottom:15,
  },
  title: {
    marginTop: 10,
    marginLeft:15,
    fontWeight: 'bold',
  },
  drawerSection: {
    marginTop: 25,
  },
  userName:{
    flexDirection:'row',
    alignItems:'center',
  },
  userBalance:{
    flexDirection:'row',
    alignItems:'center',
    marginLeft:5,
  },
  break:{
    height:20,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  },
  version:{
    fontSize:15,
    fontWeight:'bold'
  },
  versionWrap:{
    position:'absolute',
    bottom:10,left:13,
  },
  supportWrap:{
    position:'absolute',
    bottom:60,left:13,
  },
  supportButton:{

  }
})

