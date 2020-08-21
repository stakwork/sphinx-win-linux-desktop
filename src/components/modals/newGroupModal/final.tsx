import React, { useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { Button } from 'react-native-paper'
import ImagePicker from 'react-native-image-picker';
import { useStores } from '../../../store'
import { createChatPic } from '../../utils/picSrc'

export default function Final({ onFinish, contactIds }) {
  const { chats } = useStores()
  const [img, setImg] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  async function pickImage() {
    ImagePicker.launchImageLibrary({}, result => {
      if (!result.didCancel) {
        setImg(result)
      }
    })
  }
  async function finish() {
    setLoading(true)
    const group = await chats.createGroup(contactIds, text)
    if (img && img.uri) {
      await createChatPic(group.id, img.uri)
      chats.updateChatPhotoURI(group.id, img.uri)
    }
    onFinish()
    setLoading(false)
  }
  const showDone = text && text.length > 0 ? true : false
  return <View style={styles.wrap}>
    <View style={styles.mid}>
      <TouchableOpacity onPress={pickImage}>
        {img && <Image source={{ uri: img.uri }}
          style={{ width: 180, height: 180, borderRadius: 90 }} resizeMode={'cover'}
        />}
        {!img && <Image source={require('../../../../android_assets/avatar3x.png')}
          style={{ width: 180, height: 180 }} resizeMode={'cover'}
        />}
      </TouchableOpacity>
      <TextInput value={text}
        placeholder="Group Name"
        style={styles.input}
        onChangeText={text => setText(text)}
      />
    </View>
    <View style={styles.buttonWrap}>
      {showDone && <Button mode="contained" dark={true}
        onPress={finish} loading={loading}
        style={styles.button}>
        Done
      </Button>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 400
  },
  mid: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonWrap: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    height: 60,
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  button: {
    width: 150,
    marginRight: '12.5%',
    borderRadius: 30,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#6289FD'
  },
  input: {
    width: '75%',
    borderColor: '#bbb',
    borderWidth: 1,
    backgroundColor: 'white',
    height: 70,
    borderRadius: 35,
    marginTop: 30,
    fontSize: 21,
    paddingLeft: 25,
    paddingRight: 25,
    marginLeft: '12.5%',
    marginRight: '12.5%',
    marginBottom: 100,
  }
})