
import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, useTheme } from '../../store'
import {ScrollView, View, Text, StyleSheet} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Appbar, Searchbar, IconButton } from 'react-native-paper'
import ContactList from './contactList'

export default function Contacts() {
  const { ui } = useStores()
  const setAddFriendModalHandler = () => ui.setAddFriendModal(true)
  const onChangeTextHandler = (txt: string) => ui.setContactsSearchTerm(txt)
  const theme = useTheme()
  return useObserver(() =>
    <View style={{flex:1}}>
      <Header />
      <View style={{...styles.searchWrap,
        backgroundColor:theme.main
      }}>
        <View style={{...styles.searchBarWrap,
          backgroundColor:theme.main,
          borderBottomColor:theme.dark?'#141d26':'#e5e5e5'
        }}>
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeTextHandler}
            value={ui.contactsSearchTerm}
            style={{
              elevation:0,
              height:38,
              backgroundColor:theme.bg,
              borderRadius:5,
            }}
            inputStyle={{
              color:theme.title,
              fontSize:13,
            }}
            iconColor={theme.title}
            placeholderTextColor={theme.title}
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
  const theme = useTheme()
  return (
    <Appbar.Header style={{width:'100%',elevation:0,backgroundColor:theme.main}}>
      <Appbar.BackAction onPress={onGoBackHandler} color="#666" 
        accessibilityLabel="menu-close-contacts"
      />
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
    borderWidth:1,
    borderRadius:5,
  },
  iconWrap:{
    width:50,
    marginLeft:5,
  }
})
