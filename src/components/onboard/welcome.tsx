import React, {useState} from 'react'
import {View,StyleSheet,Text,Image} from 'react-native'
import { useStores } from '../../store'
import {useObserver} from 'mobx-react-lite'
import {Button} from 'react-native-paper'
import { constants } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Slider from '../utils/slider'

export default function Welcome(props) {
  const {onDone,z,show} = props
  const {user,contacts} = useStores()
  const [creatingContact, setCreatingContact] = useState(false)

  async function go(){
    setCreatingContact(true)
    await contacts.addContact({
      alias: user.invite.inviterNickname,
      public_key: user.invite.inviterPubkey,
      status: constants.contact_statuses.confirmed,
    })
    onDone()
  }

  const hasInvite = user&&user.invite&&Object.keys(user.invite)&&Object.keys(user.invite).length>0
  return useObserver(()=> {
    return <Slider z={z} show={show}>
      <Text style={styles.top}>
        A message from your friend...
      </Text>
      <View style={styles.center}>
        <Image source={require('../../../assets/avatar.png')} 
          style={{width:120,height:120}} resizeMode={'cover'}
        />
        <Text style={styles.name}>
          {user.invite.inviterNickname || 'Inviter'}
        </Text>
        <Text style={styles.message}>
          {`"${user.invite.welcomeMessage || 'Welcome to Sphinx!'}"`}
        </Text>
      </View>
      <Button mode="contained" dark={true}
        loading={creatingContact}
        onPress={go}
        style={styles.button}>
        <Text>Get Started</Text>
        <View style={{width:12,height:1}}></View>
        <Icon name="arrow-right" size={20} />
      </Button>
    </Slider>
  })
}

const styles=StyleSheet.create({
  top:{
    fontSize:32,
    marginTop:60,
    textAlign:'center',
    marginLeft:50,
    marginRight:50
  },
  center:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  name:{
    fontSize:24,
    fontWeight:'bold',
    color:'black',
    marginTop:20,
  },
  message:{
    fontSize:20,
    marginTop:20,
  },
  button:{
    backgroundColor:'#6289FD',
    borderRadius:30,
    width:'75%',
    height:60,
    display:'flex',
    justifyContent:'center',
    marginTop:28,
    marginBottom:42
  }
})