
import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {ScrollView, View, Text, StyleSheet} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Appbar, Searchbar, IconButton } from 'react-native-paper'
import ContactList from './contactList'

export default function Contacts() {
  const { ui } = useStores()
  const setAddFriendModalHandler = () => ui.setAddFriendModal(true)
  const onChangeTextHandler = (txt: string) => ui.setContactsSearchTerm(txt)
  return useObserver(() =>
    <View style={{flex:1}}>
      <Header />
      <View style={styles.searchWrap}>
        <View style={styles.searchBarWrap}>
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeTextHandler}
            value={ui.contactsSearchTerm}
            style={{elevation:0,height:38}}
            inputStyle={{color:'#666',fontSize:13}}
          />
        </View>
        <View style={styles.iconWrap}>
          <IconButton
            icon="account-plus"
            color="#aaa"
            size={20}
            onPress={setAddFriendModalHandler}
          />
        </View>
      </View>
      <ContactList />
    </View>
  )
}

function Header() {
  const navigation = useNavigation()
  const onGoBackHandler = () => navigation.goBack()
  return (
    <Appbar.Header style={{width:'100%',elevation:0,backgroundColor:'white'}}>
      <Appbar.BackAction onPress={onGoBackHandler} color="#666" />
      <Appbar.Content title="Address Book" />
    </Appbar.Header>
  )
}
  
const styles = StyleSheet.create({
  main:{
    flex:1,
  },
  searchWrap:{
    backgroundColor:'white',
    padding:5,
    width:'100%',
    flexDirection:'row'
  },
  searchBarWrap:{
    flex:1,
    borderColor:'#ddd',
    borderWidth:1,
    borderRadius:5,
  },
  iconWrap:{
    width:50,
    marginLeft:5,
  }
})
