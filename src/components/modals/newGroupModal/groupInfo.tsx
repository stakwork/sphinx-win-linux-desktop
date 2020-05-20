import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../../store'
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity} from 'react-native'
import {Portal, IconButton, Button, Dialog} from 'react-native-paper'
import ModalWrap from '../modalWrap'
import Header from './header'
import FadeView from '../../utils/fadeView'
import People from './people'
import {useChatPicSrc,createChatPic} from '../../utils/picSrc'
import moment from 'moment'
import {Contact} from './items'
import EE from '../../utils/ee'
import ImagePicker from 'react-native-image-picker';
import { constants } from '../../../constants'

export default function GroupInfo({visible}) {
  const { ui, contacts, chats } = useStores()
  const [selected, setSelected] = useState([])
  const [addPeople, setAddPeople] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaveDialog, setLeaveDialog] = useState(false)

  const group = ui.groupModalParams

  function close(){
    ui.closeGroupModal()
    setTimeout(()=>{
      setSelected([])
      setLeaveDialog(false)
    },200)
  }

  async function addGroupMembers(){
    if(!(selected && selected.length)){
      return 
    }
    setLoading(true)
    await chats.addGroupMembers(group.id, selected)
    setLoading(false)
    close()
  }

  async function exitGroup(){
    setLoading(true)
    await chats.exitGroup(group.id)
    setLoading(false)
    close()
    EE.emit('left-group')
  }

  const contactsToShow = contacts.contacts.filter(c=> {
    return c.id>1 && group && group.contact_ids.includes(c.id)
  })
  const selectedContacts = contacts.contacts.filter(c=> selected.includes(c.id))
  const showSelectedContacts = selectedContacts.length>0

  const uri = useChatPicSrc(group)

  const hasGroup = group?true:false
  const hasImg = uri?true:false

  function changePic(){
    ImagePicker.launchImageLibrary({}, async img=>{
      if (!img.didCancel) {
        if(group && group.id && img && img.uri) {
          await createChatPic(group.id, img.uri)
          chats.updateChatPhotoURI(group.id, img.uri)
          close()
        }
      }
    })
  }

  const isTribe = group && group.type===constants.chat_types.tribe

  return useObserver(() => <ModalWrap onClose={close} visible={visible}>
    <Portal.Host>
      <Header title={addPeople?'Add Contacts':'New Group'} 
        showNext={addPeople && showSelectedContacts} 
        onClose={()=>close()} nextButtonText="Add"
        next={()=>addGroupMembers()} loading={loading}
      />

      <FadeView opacity={!addPeople?1:0} style={styles.content}>

        {hasGroup && <View style={styles.groupInfo}>
          <View style={styles.groupInfoLeft}>
            <TouchableOpacity onPress={changePic}>
              <Image source={hasImg?{uri}:require('../../../../assets/avatar.png')} 
                style={{width:54,height:54,borderRadius:27}} resizeMode={'cover'}
              />
            </TouchableOpacity>
            <View style={styles.groupInfoText}>
              <Text style={styles.groupInfoName}>{group.name}</Text>
              <Text style={styles.groupInfoCreated}>{`Created on ${moment(group.created_at).format('ll')}`}</Text>
            </View>
          </View>
          <IconButton icon="dots-vertical" size={32} color="#666"
            style={{marginLeft:0,marginRight:0}} 
            onPress={()=>setLeaveDialog(true)}
          />
        </View>}

        {!isTribe && <View style={styles.members}>
          <Text style={styles.membersTitle}>GROUP MEMBERS</Text>
          <ScrollView style={styles.scroller}>
            {contactsToShow.map((c,i)=>{
              return <Contact key={i} contact={c} 
                unselectable={true}
              />
            })}
          </ScrollView>
          <Button mode="contained" dark={true} icon="plus"
            onPress={()=> setAddPeople(true)}
            style={styles.addPeople}>
            Add People
          </Button>
        </View>}
       
      </FadeView>

      <FadeView opacity={addPeople?1:0} style={styles.content}>
        <People setSelected={setSelected} 
          initialContactIds={(group&&group.contact_ids)||[]}
        />
      </FadeView>

      <Portal>
        <Dialog visible={leaveDialog} style={{bottom:10,zIndex:99}}
          onDismiss={()=> setLeaveDialog(false)}>
          <Dialog.Title>Exit Group?</Dialog.Title>
          <Dialog.Actions style={{justifyContent:'space-between'}}>
            <Button icon="cancel" onPress={()=>setLeaveDialog(false)} color="#888">
              Cancel
            </Button>
            <Button icon="exit-to-app" onPress={()=>exitGroup()} color="#DB5554">
              Exit Group
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  groupInfo:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%'
  },
  groupInfoLeft:{
    marginLeft:16,
    display:'flex',
    flexDirection:'row',
  },
  groupInfoText:{
    display:'flex',
    height:54,
    justifyContent:'center',
    marginLeft:14,
  },
  groupInfoName:{
    color:'black',
    fontSize:16
  },
  groupInfoCreated:{
    color:'#888',
    fontSize:12,
  },
  members:{
    marginTop:19,
    display:'flex',
    flexDirection:'column',
    width:'100%',
  },
  membersTitle:{
    color:'#888',
    fontSize:14,
    marginLeft:16,
  },
  membersList:{

  },
  scroller:{
    width:'100%',
  },
  addPeople:{
    height:46,
    borderRadius:23,
    width:160,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#55D1A9',
    marginLeft:16,
    marginTop:16,
    zIndex:8
  }
})

