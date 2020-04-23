import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'
import {Contact, SelectedContact} from './items'



export default function People(props) {
  const { contacts } = useStores()
  const [selected, setTheSelected] = useState([])

  function setSelected(a){
    setTheSelected(a)
    props.setSelected(a)
  }
  function add(id){
    const sel = [...selected]
    if(sel.includes(id)) {
      setSelected(sel.filter(x=> x!==id))
    } else {
      if(sel.length<props.limit||20) {
        sel.push(id)
        setSelected(sel)
      }
    }
  }

  const initialContactIds = props.initialContactIds || []
  const initialContactsToShow = contacts.contacts.filter(c=>{
    return initialContactIds.includes(c.id)
  })
  const noInitials = !(props.initialContactIds&&props.initialContactIds.length)
  
  const contactsToShow = contacts.contacts.filter(c=> c.id>1 && !initialContactIds.includes(c.id))
  const selectedContacts = contactsToShow.filter(c=> selected.includes(c.id))
  
  const showSelectedContacts = selectedContacts.length+initialContactsToShow.length>0
  function selectAll(){
    setSelected(contactsToShow.map(c=>c.id))
  }
  return useObserver(() => <>
    {showSelectedContacts && <ScrollView horizontal={true} style={styles.selContacts}>
      {initialContactsToShow.map((cts,i)=>{
        return <SelectedContact key={i} contact={cts} onPress={()=>{}} removable={false} />
      })}
      {selectedContacts.map((sc,i)=>{
        return <SelectedContact key={i} contact={sc} onPress={()=> add(sc.id)} removable={true} />
      })}
    </ScrollView>}

    <View style={styles.topBar}>
      <Text style={styles.title}>CONTACTS</Text>
      {noInitials && <TouchableOpacity style={styles.all} onPress={selectAll}>
        <Text style={styles.allText}>SELECT ALL</Text>
      </TouchableOpacity>}
    </View>

    <ScrollView style={styles.scroller}>
      {contactsToShow.map((c,i)=>{
        return <Contact key={i} contact={c} 
          onPress={()=> add(c.id)}
          selected={selected.includes(c.id)}
        />
      })}
    </ScrollView>
  </>)
}

const styles = StyleSheet.create({
  scroller:{
    width:'100%',
  },
  topBar:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    paddingLeft:15,paddingRight:15,
    marginTop:10,
  },
  title:{
    color:'#888',
    fontSize:14,
  },
  all:{},
  allText:{
    color:'#888',
    fontSize:12
  },
  selContacts:{
    height:90,maxHeight:90,width:'100%',
  },
})

