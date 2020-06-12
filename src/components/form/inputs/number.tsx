import React, {useState} from 'react'
import {View,Text} from 'react-native'
import {TextInput,IconButton,Dialog,Portal,Button} from 'react-native-paper'
import {inputStyles} from './shared'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default function NumberInput({name,label,required,error,handleBlur,setValue,value,displayOnly,description}) {
  const [q,showQ] = useState(false)
  let lab = `${label.en}${required?' *':''}`
  if(error){
    lab = `${label.en} - ${error}`
  }
  if(displayOnly) lab = label.en
  return <View style={{position:'relative'}}>
    <TextInput
      keyboardType="numeric"
      error={error}
      label={lab}
      style={inputStyles}
      onChangeText={e=> setValue(parseInt(e))}
      onBlur={handleBlur(name)}
      value={(value||value===0)?value+'':''}
    />
    {description && <>
      <IconButton icon="help" size={15} color="#888"
        style={{position:'absolute',right:5,top:5}} 
        onPress={()=> showQ(true)}
      />
      <Portal>
        <Dialog visible={q} onDismiss={()=> showQ(false)}>
        <Dialog.Title>{label.en}</Dialog.Title>
        <Text style={{padding:30,fontSize:15}}>{description}</Text>
        <Dialog.Actions>
          <Button onPress={()=>showQ(false)} labelStyle={{color:'grey'}} style={{marginRight:15}}>
            <Icon name="cancel" size={14} color="grey" />
            <View style={{width:6,height:6}}></View>
            <Text>OK</Text>
          </Button>
        </Dialog.Actions>
        </Dialog>
      </Portal>
    </>}
  </View>
}
