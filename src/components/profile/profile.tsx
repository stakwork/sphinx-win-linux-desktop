import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid} from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { Appbar, Dialog, Button, Portal, ActivityIndicator } from 'react-native-paper'
import { Card, Title } from 'react-native-paper'
import Icon from 'react-native-vector-icons/AntDesign'
import {me} from '../form/schemas'
import Form from '../form'
import Cam from '../utils/cam'
import ImgSrcDialog from '../utils/imgSrcDialog'
import {usePicSrc} from '../utils/picSrc'
import RNFetchBlob from 'rn-fetch-blob'
import * as rsa from '../../crypto/rsa'
import * as e2e from '../../crypto/e2e'
import {encode as btoa} from 'base-64'
import PIN, {userPinCode} from '../utils/pin'
import Clipboard from "@react-native-community/clipboard";

export default function Profile() {
  const { details, user, contacts, meme } = useStores()
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [takingPhoto, setTakingPhoto] = useState(false)
  const [saving,setSaving] = useState(false)
  const [photo_url, setPhotoUrl] = useState('')
  const [_,setTapCount] = useState(0)
  const [sharing,setSharing] = useState(false)
  const [showPIN,setShowPIN] = useState(false)
  const [exporting,setExporting] = useState(false)

  async function shareContactKey(){
    const me = contacts.contacts.find(c=> c.id===1)
    const contact_key = me.contact_key
    if(!contact_key) return
    setSharing(true)
    await contacts.updateContact(1, {contact_key})
    setSharing(false)
  }

  async function exportKeys(pin){
    setShowPIN(false)
    if(!pin) return
    const thePIN = await userPinCode()
    if(pin!==thePIN) return
    setExporting(true)
    const priv = await rsa.getPrivateKey()
    const me = contacts.contacts.find(c=>c.id===1)
    const pub = me && me.contact_key
    const ip = user.currentIP
    const token = user.authToken
    if(!priv || !pub || !ip || !token) return
    const str = `${priv}::${pub}::${ip}::${token}`
    const enc = await e2e.encrypt(str,pin)
    const final = btoa(`keys::${enc}`)
    Clipboard.setString(final)
    ToastAndroid.showWithGravityAndOffset(
      'Export Keys Copied',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
      0, 125
    );
    setExporting(false)
  }

  async function tookPic(img){
    setDialogOpen(false)
    setTakingPhoto(false)
    setUploading(true)
    try {
      await upload(img.uri)
    } catch(e){
      console.log(e)
      setUploading(false)
    }
  }

  async function upload(uri){

    const type = 'image/jpg'
    const name = 'Image.jpg'
    const server = meme.getDefaultServer()
    if(!server) return

    RNFetchBlob.fetch('POST', `https://${server.host}/public`, {
      Authorization: `Bearer ${server.token}`,
      'Content-Type': 'multipart/form-data'
    }, [{
        name:'file',
        filename:name,
        type: type,
        data: RNFetchBlob.wrap(uri)
      }, {name:'name', data:name}
    ])
    .uploadProgress({ interval : 250 },(written, total) => {
      // console.log('uploaded', written / total)
    })
    .then(async (resp) => {
      let json = resp.json()
      if(json.muid){
        setPhotoUrl(`https://${server.host}/public/${json.muid}`)
      }
      setUploading(false)
    })
    .catch((err) => {
       console.log(err)
       setUploading(false)
    })
  }

  return useObserver(()=> {
    const meContact = contacts.contacts.find(c=> c.id===1)
    let imgURI = usePicSrc(meContact)
    if(photo_url) imgURI = photo_url

    if(showPIN) {
      return <PIN forceEnterMode={true}
        onFinish={pin=> exportKeys(pin)}
      />
    }

    return <View style={styles.wrap}>
      <Header />
      <View style={styles.userInfoSection}>
        <View >
          <TouchableOpacity onPress={()=>setDialogOpen(true)}
            style={styles.userPic}>
            <Image resizeMode="cover" 
              source={imgURI?{uri:imgURI}:require('../../../android_assets/avatar.png')}
              style={{width:60,height:60,borderRadius:30}}
            />
            {uploading && <ActivityIndicator animating={true} color="#55D1A9" style={styles.spinner} />}
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Title style={styles.title}>{user.alias}</Title>  
          <View style={styles.userBalance}>
            <Text>{details.balance}</Text>
            <Text style={{marginLeft:10,marginRight:10,color:'#c0c0c0'}}>sat</Text>
            <TouchableOpacity onPress={()=>{
              setTapCount(cu=>{
                if(cu>=6) { // seventh tap
                  shareContactKey()
                  return 0
                }
                return cu+1
              })
            }}>
              {sharing ? 
                <View style={{height:20,paddingTop:4}}>
                  <ActivityIndicator animating={true} color="#d0d0d0" size={12} style={{marginLeft:4}} />
                </View> :
                <Icon name="wallet" color="#d0d0d0" size={20} />
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.formWrap}>
        <Form schema={me} loading={saving}
          buttonText="Save"
          readOnlyFields={['public_key']}
          forceEnable={photo_url}
          initialValues={{
            alias: user.alias,
            public_key: user.publicKey,
            private_photo: meContact.private_photo||false
          }}
          onSubmit={async values=> {
            setSaving(true)
            await contacts.updateContact(1,{
              alias: values.alias,
              private_photo: values.private_photo,
              ...photo_url && {photo_url},
            })
            setSaving(false)
          }}
        />
      </View>

      <TouchableOpacity style={styles.export} onPress={()=>setShowPIN(true)}>
        <Text style={styles.exportText}>
          {!exporting ? 'Want to switch devices? Export keys' :
            'Encrypting keys with your PIN........'
          }
        </Text>
      </TouchableOpacity>

      <ImgSrcDialog 
        open={dialogOpen} onClose={()=>setDialogOpen(false)}
        onPick={res=> tookPic(res)}
        onChooseCam={()=> setTakingPhoto(true)}
      />

      {takingPhoto && <Portal>
        <Cam onCancel={()=>setTakingPhoto(false)} 
          onSnap={pic=> tookPic(pic)}
        />
      </Portal>}

    </View>}
  )
}

function Header() {
  const navigation = useNavigation()
  return (
    <Appbar.Header style={{width:'100%',backgroundColor:'white'}}>
      <Appbar.Action icon="menu" onPress={()=>navigation.dispatch(DrawerActions.openDrawer())} />
      <Appbar.Content title="Profile" />
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
  },
  content:{
    flex:1,
    width:'100%',
    marginTop:10,
    alignItems:'center',
  },
  userInfoSection: {
    paddingLeft: 20,
    marginBottom:25,
    marginTop:25,
    flexDirection:'row'
  },
  drawerSection: {
    marginTop: 25,
  },
  userPic:{
    flexDirection:'row',
    alignItems:'center',
    minHeight:62,minWidth:62,
    height:62,width:62,
    flexShrink:0,
    borderColor:'#ddd',
    borderWidth:1,
    borderRadius:31,
    position:'relative'
  },
  userInfo:{
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',
    justifyContent:'flex-start',
    marginLeft:15
  },
  title: {
    fontWeight: 'bold',
    flexDirection:'row',
    alignItems:'center',
  },
  userBalance:{
    flexDirection:'row',
    alignItems:'center',
  },
  img:{
    height:50,
    width:50,
    borderRadius:25,
  },
  spinner:{
    position:'absolute',
    left:19,
    top:19
  },
  formWrap:{
    backgroundColor:'white',
    flex:1,
    paddingBottom:30,
    maxHeight:365,
    position:'relative',
    borderBottomWidth:1,
    borderBottomColor:'#ddd',
    borderTopWidth:1,
    borderTopColor:'#ddd',
  },
  export:{
    width:'100%',
    backgroundColor:'white',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    height:50,
    marginTop:10,
    borderBottomWidth:1,
    borderBottomColor:'#ddd',
    borderTopWidth:1,
    borderTopColor:'#ddd',
  },
  exportText:{
    color:'#6289FD',
    fontSize:12,
  }
})
