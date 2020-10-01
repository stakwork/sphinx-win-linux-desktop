import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { SwipeRow } from 'react-native-swipe-list-view'
import { IconButton } from 'react-native-paper'
import FastImage from 'react-native-fast-image'
import { usePicSrc } from '../../../../utils/picSrc'
import {useStores} from '../../../../../store'
import { Props } from './types/props.interface'

export default function Item(props: Props) {
  const { contact, onPress, styles } = props
  const { contacts } = useStores()

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
            <FastImage source={hasImg?{uri}:require('../../../../../../android_assets/avatar.png')} 
              style={{width:44,height:44}} resizeMode={FastImage.resizeMode.cover}
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