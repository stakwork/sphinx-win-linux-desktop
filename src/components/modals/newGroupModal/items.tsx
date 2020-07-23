import React from 'react'
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native'
import {RadioButton} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {usePicSrc} from '../../utils/picSrc'
import {SwipeRow} from 'react-native-swipe-list-view'
import {IconButton} from 'react-native-paper'

export function DeletableContact(props){
  const {contact,onDelete} =props
  const uri = usePicSrc(contact)
  const hasImg = uri?true:false
  return <SwipeRow disableRightSwipe={true} friction={100}
    rightOpenValue={-80} stopRightSwipe={-80}>
    <View style={styles.backSwipeRow}>
      <IconButton
        icon="trash-can-outline"
        color="white"
        size={25}
        onPress={()=> onDelete(contact.id)}
        style={{marginRight:20}}
      />
    </View>
    <View style={styles.frontSwipeRow}>
      <View style={styles.avatar}>
        <Image source={hasImg?{uri}:require('../../../../android_assets/avatar.png')}
          style={{width:44,height:44}} resizeMode={'cover'}
        />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactName}>{contact.alias}</Text>
      </View>
    </View>
  </SwipeRow>
}

export function Contact(props){
  const {contact,onPress,selected,unselectable} =props
  const uri = usePicSrc(contact)
  const hasImg = uri?true:false
  return <TouchableOpacity style={styles.contactTouch} activeOpacity={1}
    onPress={onPress}>
    <View style={styles.avatar}>
      <Image source={hasImg?{uri}:require('../../../../android_assets/avatar.png')}
        style={{width:44,height:44}} resizeMode={'cover'}
      />
    </View>
    <View style={styles.contactContent}>
      <Text style={styles.contactName}>{contact.alias}</Text>
    </View>
    <View style={styles.checker}>
      {!unselectable && <RadioButton status={selected?'checked':'unchecked'} 
        value="contact" color="#6289FD"
        onPress={onPress}
      />}
    </View>
  </TouchableOpacity>
}

export function SelectedContact({contact, onPress, removable}){
  const uri = usePicSrc(contact)
  const hasImg = uri?true:false
  return <View style={styles.selectedContact}>
    <View style={styles.selAvatar}>
      <Image source={hasImg?{uri}:require('../../../../android_assets/avatar.png')} 
        style={{width:54,height:54,borderRadius:27}} resizeMode={'cover'}
      />
      {removable && <TouchableOpacity style={styles.tinyButton} onPress={onPress}>
        <Icon name="close" color="white" size={14} />
      </TouchableOpacity>}
    </View>
    <Text style={styles.selName}>{contact.alias}</Text>
  </View>
}

const styles = StyleSheet.create({
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
    justifyContent:'space-between',
    height:80,
    alignItems:'center',
    width:'100%',
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
  checker:{
    width:60,height:80,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  selectedContact:{
    width:80,
    height:90,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  },
  selName:{
    fontSize:11,
    width:'100%',
    textAlign:'center'
  },
  selAvatar:{
    position:'relative',
  },
  tinyButton:{
    height:18,width:18,
    borderRadius:9,
    backgroundColor:'#6289FD',
    position:'absolute',
    top:0,right:0,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  backSwipeRow:{
    backgroundColor:'#DB5554',
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-end',
  },
  frontSwipeRow:{
    backgroundColor:'white',
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    height:80
  }
})

