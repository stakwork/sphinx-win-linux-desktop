import React from 'react'
import {useStores} from '../../../store'
import {useObserver} from 'mobx-react-lite'
import { SectionList, View, Text } from 'react-native'
import { Item } from './components'
import { grouper } from './helpers'
import styles from './styles'

export default function ContactList() {
  const {ui, contacts} = useStores()
  return useObserver(()=> {
    const contactsToShow = contacts.contacts.filter(c=> {
      if (!ui.contactsSearchTerm) return true
      return c.alias.toLowerCase().includes(ui.contactsSearchTerm.toLowerCase())
    })
    const contactsNotMe = contactsToShow.filter(c=> c.id!==1).sort((a,b)=> a.alias>b.alias?1:-1)
    const contactsNotFromGroups = contactsNotMe.filter(c=> !c.from_group)

    const renderItem = ({ item }) => (
      <Item
        contact={item}
        onPress={contact => ui.setEditContactModal(contact)}
        styles={styles}
      />
    )

    return <View style={styles.container}>
      <SectionList
        style={styles.list}
        sections={grouper(contactsNotFromGroups)}
        keyExtractor={(item:{[k:string]:any}, index) => {
          return item.alias+index+item.photo_url
        }}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
      />
    </View>
  })
}