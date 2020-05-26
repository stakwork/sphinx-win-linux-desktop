import React, {useState} from 'react'
import {View, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native'
import {Button} from 'react-native-paper'
import ImagePicker from 'react-native-image-picker';
import { useStores } from '../../../store'
import {createChatPic} from '../../utils/picSrc'
import Form from '../../form'
import {tribe} from '../../form/schemas'

export default function NewTribe({onFinish}){
  const { ui, chats } = useStores()
  const [loading, setLoading] = useState(false)
  const [img, setImg] = useState(null)

  async function pickImage() {
    ImagePicker.launchImageLibrary({}, result=>{
      if (!result.didCancel) {
        setImg(result)
      }
    })
  }

  async function finish(v){
    setLoading(true)
    if(ui.editTribeParams){
      await chats.editTribe({
        ...v,
        uuid: ui.editTribeParams.uuid
      })
    } else {
      await chats.createTribe(v)
    }
    // if(img && img.uri) {
    //   await createChatPic(group.id, img.uri)
    //   chats.updateChatPhotoURI(group.id, img.uri)
    // }
    onFinish()
    setLoading(false)
  }
  const showDone = true

  return <View style={styles.wrap}>
    <ScrollView style={styles.scroller} contentContainerStyle={styles.container}>
      {/* <TouchableOpacity onPress={pickImage}>
        {img && <Image source={{uri: img.uri}} 
          style={{width:180,height:180,borderRadius:90}} resizeMode={'cover'}
        />}
        {!img && <Image source={require('../../../../assets/avatar3x.png')} 
          style={{width:180,height:180}} resizeMode={'cover'}
        />}
      </TouchableOpacity> */}
      <Form schema={tribe} loading={loading} 
        buttonText={(ui.editTribeParams?'Edit':'Create')+' Group'}
        onSubmit={finish}
        initialValues={ui.editTribeParams}
      />
    </ScrollView>
  </View>
}

const styles=StyleSheet.create({
  wrap:{
    display:'flex',
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
    minHeight:400,
  },
  scroller:{
    width:'100%',
    flex:1,
    display:'flex',
  },
  container:{
    width:'100%',
    paddingBottom:20,
  },
  buttonWrap:{
    position:'absolute',
    bottom:12,
    width:'100%',
    height:60,
    display:'flex',
    flexDirection:'row-reverse',
  },
  button:{
    width:150,
    marginRight:'12.5%',
    borderRadius:30,
    height:60,
    display:'flex',
    justifyContent:'center',
    backgroundColor:'#6289FD'
  },
  input:{
    width:'75%',
    borderColor:'#bbb',
    borderWidth:1,
    backgroundColor:'white',
    height:70,
    borderRadius:35,
    marginTop:30,
    fontSize:21,
    paddingLeft:25,
    paddingRight:25,
    marginLeft:'12.5%',
    marginRight:'12.5%',
    marginBottom:100,
  }
})