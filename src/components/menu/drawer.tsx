import React from 'react'
import {StyleSheet, View, Text, Image, Dimensions} from 'react-native'
import {DrawerContentScrollView,DrawerItem} from '@react-navigation/drawer'
import {Title,Drawer,Button} from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useStores, useTheme } from '../../store'
import { useObserver } from 'mobx-react-lite'
import {usePicSrc} from '../utils/picSrc'
import VERSION from '../../version'
import { TouchableOpacity } from 'react-native-gesture-handler'

const itemStyle = {height:60,paddingLeft:15}

export default function TheDrawer(props) {
  const {ui, details, user, contacts} = useStores()
  const theme = useTheme()
  const me = contacts.contacts.find(c=> c.id===user.myid)
  const uri = usePicSrc(me)
  const height = Math.round(Dimensions.get('window').height)
  const hasImg = uri?true:false
  const { navigation: { navigate } } = props
  const goToDashboardHandler = () => navigate('Dashboard')
  const goToContactsHandler = () => navigate('Contacts')
  const goToProfileHandler = () => navigate('Profile')
  const openAddFriendModalHandler = () => ui.setAddFriendModal(true)
  const openSupportModalHandler = () => ui.setSupportModal(true)
  const setNewGroupModalHandler = () => ui.setNewGroupModal(true)

  return useObserver(() =>
    <DrawerContentScrollView {...props} style={{...props.style,backgroundColor:theme.main}}>
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
              <Text style={{marginLeft:60,color:theme.title}}>{details.balance}</Text>
              <Text style={{marginLeft:10,marginRight:10,color:'#c0c0c0'}}>sat</Text>
              <AntDesign name="wallet" color="#d0d0d0" size={20} />
            </View>
            <View style={{marginLeft:60,marginTop:12}}>
              <TouchableOpacity style={{...styles.addSats,backgroundColor:theme.primary}}
                onPress={()=> ui.setAddSatsModal(true)}>
                <Text style={{color:'white',fontSize:10}}>ADD SATS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{...styles.break,borderBottomColor:theme.bg}}></View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <AntDesign name="message1" color={theme.title} size={size} />
            )}
            label="Dashboard"
            onPress={goToDashboardHandler}
            labelStyle={{color:theme.title}}
          />
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="account-multiple" color={theme.title} size={size} />
            )}
            label="Contacts"
            onPress={goToContactsHandler}
            labelStyle={{color:theme.title}}
          />
          <DrawerItem style={itemStyle}
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="account" color={theme.title} size={size} />
            )}
            label="Profile"
            onPress={goToProfileHandler}
            labelStyle={{color:theme.title}}
          />
        </Drawer.Section>
        <Button icon="plus" mode="contained" dark={true}
          accessibilityLabel="menu-add-friend"
          onPress={openAddFriendModalHandler}
          style={{backgroundColor:'#55D1A9',borderRadius:25,width:'60%',height:50,display:'flex',justifyContent:'center',marginLeft:20,marginTop:15}}>
          Add Friend
        </Button>
        <Button mode="contained" dark={true} icon="plus"
          accessibilityLabel="menu-new-group-button" 
          style={{backgroundColor:theme.primary,borderRadius:25,width:'60%',height:50,display:'flex',justifyContent:'center',marginLeft:20,marginTop:22}}
          onPress={setNewGroupModalHandler}>
          Tribe
        </Button>
        <View style={styles.versionWrap}>
          <Text style={{...styles.versionWrap,color:theme.title}}>
            {`Version: ${VERSION}`}
          </Text>
        </View>
        <View style={styles.supportWrap}>
          <Button style={styles.supportButton} icon="email"
            accessibilityLabel="menu-support"
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

  },
  addSats:{
    width:80,
    height:32,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:16
  }
})

