import React, {useState} from 'react'
import {Text, View, StyleSheet} from 'react-native'
import {IconButton, Button} from 'react-native-paper'
import {constantCodes} from '../../../constants'

export default function MemberRequest(props){
  const [loadingStatus, setLoadingStatus] = useState('')
  const typ = constantCodes['message_types'][props.type]

  let msg = ''
  if(typ==='member_approve') msg='Welcome!'
  if(typ==='member_reject') msg='The admin declined your request'
  if(props.isTribeOwner) {
    msg = `${props.senderAlias} wants to join the group`
    if(typ==='member_approve') msg='You have approved the request'
    if(typ==='member_reject') msg='You have declined the request'
  }

  async function press(status:string){
    console.log(typ)
    if(typ!=='member_request') return
    setLoadingStatus(status)
    await props.onApproveOrDenyMember(props.sender,status,props.id)
    setLoadingStatus('')
  }
  return <View style={styles.row}>
    <View style={{...styles.wrap,width:props.isTribeOwner?280:'auto'}}>
      <Text style={styles.text} numberOfLines={2}>{msg}</Text>
      {props.isTribeOwner && <View style={styles.right}>
        <ApproveButton disabled={typ==='member_reject'} 
          onPress={()=>press('approved')} loading={loadingStatus==='approved'}
        />
        <RejectButton disabled={typ==='member_approve'} 
          onPress={()=>press('rejected')} loading={loadingStatus==='rejected'}
        />
      </View>}
      {!props.isTribeOwner && typ==='member_reject' && <View style={styles.del}>
        <Button color="#ff5e61" style={{width:90,borderRadius:5}} labelStyle={{color:'white'}} mode="contained"
          onPress={props.onDeleteChat}>
          Delete
        </Button>
      </View>}
    </View>
  </View>
}

export function ApproveButton({onPress,disabled,loading}){
  return <IconButton icon={loading?'loading':'check'}
    color="white" style={{backgroundColor:'#3dba83'}}
    disabled={disabled} onPress={()=>{
      if(!disabled) onPress()
    }}
  />
}
export function RejectButton({onPress,disabled,loading}){
  return <IconButton icon={loading?'loading':'close'}
    color="white" style={{backgroundColor:'#ff5e61'}}
    disabled={disabled} onPress={()=>{
      if(!disabled) onPress()
    }}
  />
}

const styles = StyleSheet.create({
  row:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    margin:8,
  },
  wrap:{
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    paddingLeft:12,
    paddingRight:12,
    paddingTop:5,
    paddingBottom:5,
    borderWidth:1,
    borderColor:'#DADFE2',
    backgroundColor:'#F9FAFC',
    borderRadius:6,
  },
  right:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    width:100,
    maxWidth:100,
    minWidth:100,
    flexShrink:0,
  },
  text:{
    color:'#333',
    fontSize:13,
    maxWidth:150,
    marginRight:10,
    textAlign:'center',
  },
  button:{
    height:32,width:32,
    borderRadius:24,
  },
  del:{
    width:85,
    flexShrink:0,
  }
})