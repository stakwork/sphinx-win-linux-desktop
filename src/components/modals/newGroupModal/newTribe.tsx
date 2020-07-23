import React, {useState} from 'react'
import {View, ScrollView, StyleSheet} from 'react-native'
import ImagePicker from 'react-native-image-picker';
import { useStores } from '../../../store'
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
        id: ui.editTribeParams.id
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
        {!img && <Image source={require('../../../../android_assets/avatar3x.png')} 
          style={{width:180,height:180}} resizeMode={'cover'}
        />}
      </TouchableOpacity> */}
      <Form schema={tribe} loading={loading} 
        buttonText={(ui.editTribeParams?'Edit':'Create')+' Group'}
        onSubmit={finish}
        initialValues={ui.editTribeParams?ui.editTribeParams:{
          escrow_amount:10, escrow_time:12,
          price_to_join:0, price_per_message:0,
        }}
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
})