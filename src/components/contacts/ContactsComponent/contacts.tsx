
import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
 import { View } from 'react-native'
import { Searchbar, IconButton } from 'react-native-paper'
import ContactList from '../ContactList'
import { Header } from './components'
import styles from './styles'

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