import React from 'react'
import {useStores} from '../../store'
import {useObserver} from 'mobx-react-lite'
import { TouchableOpacity, SectionList, View, Text, StyleSheet, Image } from 'react-native'
import {SwipeRow} from 'react-native-swipe-list-view'
import {IconButton} from 'react-native-paper'
import {usePicSrc} from '../utils/picSrc'

export default function ContactList() {
  const {ui, contacts} = useStores()
  return useObserver(()=> {
    const contactsToShow = contacts.contacts.filter(c=> {
      if (!ui.contactsSearchTerm) return true
      return c.alias.toLowerCase().includes(ui.contactsSearchTerm.toLowerCase())
    })
    const contactsNotMe = contactsToShow.filter(c=> c.id!==1).sort((a,b)=> a.alias>b.alias?1:-1)
    return <View style={styles.container}>
      <SectionList
        style={styles.list}
        sections={grouper(contactsNotMe)}
        keyExtractor={(item:{[k:string]:any}, index) => {
          return item.alias+index
        }}
        renderItem={({ item }) => <Item contact={item} 
          onPress={contact=> ui.setEditContactModal(contact)} 
        />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
      />
    </View>
  })
}

function Item({ contact, onPress }) {
  const {ui, contacts} = useStores()
  
  const uri = usePicSrc(contact)
  
  const hasImg = uri?true:false
  return (
    <SwipeRow disableRightSwipe={true} friction={100}
      rightOpenValue={-80} stopRightSwipe={-80}>
      <View style={styles.backSwipeRow}>
        <IconButton
          icon="trash-can-outline"
          color="white"
          size={25}
          onPress={()=> contacts.deleteContact(contact.id)}
          style={{marginRight:20}}
        />
      </View>
      <View style={styles.frontSwipeRow}>
        <TouchableOpacity style={styles.contactTouch} activeOpacity={0.5}
          onPress={()=>onPress(contact)}>
          <View style={styles.avatar}>
            <Image source={hasImg?{uri:'file://'+uri}:require('../../../assets/avatar.png')} 
              style={{width:44,height:44}} resizeMode={'cover'}
            />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactName}>{contact.alias}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SwipeRow>
  )
}

function grouper(data){ 
  // takes "alias"
  const ret = []
  const groups = data.reduce((r, e) => {
    let title = e.alias[0]
    if(!r[title]) r[title] = {title, data:[e]}
    else r[title].data.push(e)
    return r
  }, {})
  Object.values(groups).forEach(g=>{
    ret.push(g)
  })
  return ret
}

const styles = StyleSheet.create({
  container:{
    height:'100%',
    backgroundColor:'white'
  },
  list:{
    flex:1
  },
  section:{
    paddingLeft:24,
    height:35,
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#eee',
  },
  sectionTitle:{
    fontWeight:'bold',
  },
  avatar:{
    width:44,height:44,
    borderRadius:23,
    overflow:'hidden',
    backgroundColor:'transparent',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginRight:18,
    marginLeft:18,
    borderWidth:1,
    borderColor:'#eee'
  },
  contactTouch:{
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    height:80,
    alignItems:'center'
  },
  contactContent:{
    flex:1,
  },
  contactName:{
    marginRight:12,
    fontSize:16,
    fontWeight:'bold',
    color:'#666',
  },
  backSwipeRow:{
    backgroundColor:'#DB5554',
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-end'
  },
  frontSwipeRow:{
    backgroundColor:'white',
    flex:1,
    height:80
  }
})
