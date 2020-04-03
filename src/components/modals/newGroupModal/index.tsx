import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'
import {Portal} from 'react-native-paper'
import ModalWrap from '../modalWrap'
import Header from './header'
import {Contact, SelectedContact} from './items'
import FadeView from '../../utils/fadeView'
import Final from './final'

export default function NewGroup({visible}) {
  const { ui, contacts } = useStores()
  const [selected, setSelected] = useState([])
  const [next, setNext] = useState(false)
  function add(id){
    const sel = [...selected]
    if(sel.includes(id)) {
      setSelected(sel.filter(x=> x!==id))
    } else {
      sel.push(id)
      setSelected(sel)
    }
  }
  function close(){
    ui.setNewGroupModal(false)
    setTimeout(()=>{
      setNext(false)
      setSelected([])
    },200)
  }
  const contactsToShow = contacts.contacts.filter(c=> c.id>1)
  const selectedContacts = contactsToShow.filter(c=> selected.includes(c.id))
  const showSelectedContacts = selectedContacts.length>0
  function selectAll(){
    setSelected(contactsToShow.map(c=>c.id))
  }
  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title="New Group" onClose={()=>close()} 
        showNext={!next && showSelectedContacts} next={()=>setNext(true)}
      />

      <FadeView opacity={next?0:1} style={styles.content}>
        {showSelectedContacts && <ScrollView horizontal={true} style={styles.selContacts}>
          {selectedContacts.map((sc,i)=>{
            return <SelectedContact key={i} contact={sc} onPress={()=> add(sc.id)} />
          })}
        </ScrollView>}

        <View style={styles.topBar}>
          <Text style={styles.title}>CONTACTS</Text>
          <TouchableOpacity style={styles.all} onPress={selectAll}>
            <Text style={styles.allText}>SELECT ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroller}>
          {contactsToShow.map((c,i)=>{
            return <Contact key={i} contact={c} 
              onPress={()=> add(c.id)}
              selected={selected.includes(c.id)}
            />
          })}
        </ScrollView>
      </FadeView>

      <FadeView opacity={next?1:0} style={styles.content}>
        <Final onFinish={close} contactIds={selected} />
      </FadeView>

    </Portal.Host>
  </ModalWrap>)
}



const styles = StyleSheet.create({
  content:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    marginBottom:40,
  },
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

