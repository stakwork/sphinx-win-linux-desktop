import React, {useState} from 'react'
import {Text, View} from 'react-native'
import {IconButton,Portal,Dialog,Button} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function QDialog({description,label}){
  const [q,showQ] = useState(false)
  return <>
    <IconButton icon="help" size={15} color="#888"
      style={{position:'absolute',right:5,top:5}} 
      onPress={()=> showQ(true)}
    />
    <Portal>
      <Dialog visible={q} onDismiss={()=> showQ(false)}>
      <Dialog.Title>{label}</Dialog.Title>
      <Text style={{padding:30,fontSize:15}}>{description}</Text>
      <Dialog.Actions>
        <Button onPress={()=>showQ(false)} labelStyle={{color:'grey'}} style={{marginRight:15}}>
          <Icon name="close" size={14} color="grey" />
          <View style={{width:6,height:6}}></View>
          <Text>OK</Text>
        </Button>
      </Dialog.Actions>
      </Dialog>
    </Portal>     
  </>
}