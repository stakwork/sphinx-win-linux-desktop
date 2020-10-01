import React, {useState} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, TouchableOpacity, Image, ToastAndroid} from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { Portal, ActivityIndicator } from 'react-native-paper'
import { Title } from 'react-native-paper'
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
import styles from './styles'
import { Header } from './components'
import { shareContactKey, tookPic } from './utils'

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
      <Header useNavigation={useNavigation} drawerActions={DrawerActions} />
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
                  shareContactKey(contacts, setSharing)
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
        onPick={res=> tookPic(res, setDialogOpen, setTakingPhoto, setUploading, upload)}
        onChooseCam={()=> setTakingPhoto(true)}
      />
      {takingPhoto && <Portal>
        <Cam onCancel={()=>setTakingPhoto(false)}
          onSnap={pic=> tookPic(pic, setDialogOpen, setTakingPhoto, setUploading, upload)}
        />
      </Portal>}
    </View>}
  )
}