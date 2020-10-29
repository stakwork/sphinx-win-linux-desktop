import React, {useState,useEffect} from 'react'
import { useStores, useTheme } from '../../store'
import {View, Text, StyleSheet, TextInput} from 'react-native'
import {Button} from 'react-native-paper'

export default function InviteNewUser({done}){
  const theme = useTheme()
  const {contacts} = useStores()
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(null)

  async function invite(){
    setLoading(true)
    await contacts.createInvite(text,msg)
    setLoading(false)
    done()
  }

  useEffect(()=>{
    (async () => {
      const price = await contacts.getLowestPriceForInvite()
      console.log("PRICE",price)
      if(price||price===0) setPrice(price)
    })()
  },[])

  const hasPrice = price||price===0 
  return <View style={styles.former}>
    <View style={{...styles.inviteRow,marginTop:25}}>
      <Text style={{...styles.inviteLabel,color:theme.title}}>NICKNAME</Text>
    </View>
    <View style={styles.inviteRow}>
      <TextInput value={text}
        accessibilityLabel="add-friend-alias-input"
        onChangeText={t=> setText(t)}
        style={styles.inviteNicknameInput}
      />
    </View>
    <View style={{...styles.inviteRow,marginTop:25}}>
      <Text style={{...styles.inviteLabel,color:theme.title}}>INCLUDE A MESSAGE ...</Text>
    </View>
    <View style={styles.inviteRow}>
      <TextInput value={msg}
        accessibilityLabel="add-friend-message-input"
        placeholder="Welcome to Sphinx!"
        multiline={true} blurOnSubmit={true}
        numberOfLines={3}
        textAlignVertical="top"
        onChangeText={t=> setMsg(t)}
        style={styles.inviteMsgInput}
      />
    </View>
    <View style={styles.inviteFinalRow}>
      {hasPrice ? <View style={styles.estimatedCost}>
        <Text style={{...styles.estimatedCostText,color:theme.title}}>ESTIMATED COST</Text>
        <View style={styles.estimatedCostBottom}>
          <Text style={{...styles.estimatedCostNum,color:theme.title}}>
            {price}
          </Text>
          <Text style={styles.estimatedCostSat}>sat</Text>
        </View>
      </View> : <View></View>}
      <Button accessibilityLabel="add-friend-button"
        style={{backgroundColor:'#55D1A9',borderRadius:30,width:200,height:58,display:'flex',justifyContent:'center'}}
        mode="contained" dark={true} loading={loading}
        // disabled={!hasPrice}
        onPress={()=> invite()}>
        Create Invitation
      </Button>
    </View>
  </View>
}

const styles = StyleSheet.create({
  former:{
    flex:1,
    alignItems:'center',
    justifyContent:'flex-start',
    width:'100%',
  },
  inviteRow:{
    width:'100%',
    flexDirection:'row',
    justifyContent:'center',
    marginBottom:10,
    marginTop:10,
  },
  inviteLabel:{
    fontWeight:'bold',
    fontSize:12,
  },
  inviteNicknameInput:{
    width:'94%',
    borderColor:'#DADFE2',
    backgroundColor:'#F9FAFC',
    borderWidth:1,
    borderRadius:5,
    height:42,
    paddingLeft:15,
  },
  inviteMsgInput:{
    width:'94%',
    borderColor:'#DADFE2',
    backgroundColor:'#F9FAFC',
    borderWidth:1,
    borderRadius:5,
    // height:50,
    paddingLeft:15,
  },
  inviteFinalRow:{
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:10,
    marginTop:15,
    paddingLeft:'3%',
    paddingRight:'3%'
  },
  estimatedCost:{
    flexDirection:'column'
  },
  estimatedCostText:{
    fontSize:10,
    color:'#aaa'
  },
  estimatedCostBottom:{
    flexDirection:'row'
  },
  estimatedCostNum:{
    fontSize:20,
    fontWeight:'bold',
    color:'black',
    marginRight:5
  },
  estimatedCostSat:{
    fontSize:20,
    color:'#888'
  }
})

