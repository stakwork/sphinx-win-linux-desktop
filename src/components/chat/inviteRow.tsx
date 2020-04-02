import React, {useState} from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native'
import {Dialog, Portal, Button} from 'react-native-paper'
import {constantCodes} from '../../constants'
import {useStores} from '../../store'

export default function InviteRow(props){
  const {contacts,ui} = useStores()
  const {name, invite} = props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  console.log("INVITE",invite)
  const statusString = constantCodes['invite_statuses'][invite.status]

  const actions = {
    'payment_pending': ()=> setDialogOpen(true),
    'ready': ()=> ui.setShareInviteModal(invite.invite_string),
    'delivered': ()=> ui.setShareInviteModal(invite.invite_string)
  }
  function doAction(){
    if(actions[statusString]) actions[statusString]()
  }
  return <TouchableOpacity style={styles.chatRow} activeOpacity={0.5}
    onPress={()=> doAction()}>
    <View style={styles.inviteQR}>
      <Image style={{height:40,width:40}} source={require('../../../assets/invite_qr.png')} />
    </View>
    <View style={styles.chatContent}>
      <Text style={styles.chatName}>{`Invite: ${name}`}</Text>
      <View style={styles.chatMsgWrap}>
        {inviteIcon(statusString)}
        <Text style={styles.chatMsg}>{inviteMsg(statusString, name)}</Text>
      </View>
    </View>

    <Portal>
      <Dialog visible={dialogOpen} style={{bottom:10}}
        onDismiss={()=>setDialogOpen(false)}>
        <Dialog.Title>Pay for Invitation?</Dialog.Title>
        <Dialog.Actions style={{justifyContent:'space-between'}}>
          <Button onPress={()=>setDialogOpen(false)} labelStyle={{color:'grey'}}>
            <Icon name="cancel" size={14} color="grey" />
            <View style={{width:4,height:6}}></View>
            <Text>Cancel</Text>
          </Button>
          <Button icon="credit-card" loading={loading} onPress={async()=>{
            setLoading(true)
            await contacts.payInvite(invite.invite_string)
            setDialogOpen(false)
            setLoading(false)
          }}>
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
    
  </TouchableOpacity>
}

function inviteIcon(statusString){
  switch (statusString) {
    case 'payment_pending':
      return <Icon 
        name="credit-card" size={14} color="grey" style={{marginRight:4}}
      />
    case 'ready': 
      return <Icon 
        name="check" size={14} color="#64C684" style={{marginRight:4}}
      />
    case 'delivered': 
      return <Icon 
        name="check" size={14} color="#64C684" style={{marginRight:4}}
      />
    default:
      return <></>
  }
}
function inviteMsg(statusString: string, name: string){
  switch (statusString) {
    case 'pending':
      return `${name} is on the waitlist`
    case 'payment_pending':
      return 'Tap to pay and activate the invite'
    case 'ready':
      return 'Ready! Tap to share. Expires in 24 hours'
    case 'delivered':
      return 'Ready! Tap to share. Expires in 24 hours'
    case 'in_progress':
      return `${name} is signing on`
    case 'expired':
      return 'Expired'
    default:
      return 'Signup complete'
  }
}

export const styles = StyleSheet.create({
  inviteQR:{
    width:40,height:40,
    overflow:'hidden',
    backgroundColor:'transparent',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginRight:18,
    marginLeft:18,
  },
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
  chatRow:{
    height:80,
    width:'100%',
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    borderBottomWidth:1,
    borderBottomColor:'#e5e5e5',
    backgroundColor:'white',
  },
  chatContent:{
    display:'flex',
    flexDirection:'column'
  },
  chatName:{
    marginRight:12,
    fontSize:16,
    fontWeight:'bold',
    color:'#666',
    marginBottom:4,
  },
  chatMsgWrap:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center'
  },
  chatMsg:{
    color:'#7e7e7e',
    fontSize:13,
  },
})