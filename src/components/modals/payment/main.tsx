import React, {useState} from 'react'
import {View, StyleSheet, Text, TextInput, Dimensions} from 'react-native'
import {Button,Avatar} from 'react-native-paper'
import NumKey from '../../utils/numkey'
import {usePicSrc} from '../../utils/picSrc'
import { useStores } from '../../../store'

export default function Main({contact,loading,confirmOrContinue,contactless}){
  const {ui} = useStores()
  const [amt, setAmt] = useState('0')
  const [text, setText] = useState('')
  const [inputFocused,setInputFocused] = useState(false)

  const height = Math.round(Dimensions.get('window').height) - 80
  const uri = usePicSrc(contact)
  const hasImg = uri?true:false

  function go(n){
    if(amt==='0') setAmt(`${n}`)
    else setAmt(`${amt}${n}`)
  }
  function backspace(){
    if(amt.length===1){
      setAmt('0')
    } else {
      const newAmt = amt.substr(0, amt.length-1)
      setAmt(newAmt)
    }
  }
  return <View style={{...styles.wrap,maxHeight:height,minHeight:height,
    justifyContent:contact?'space-around':'center'
  }}>

    {contact && <View style={styles.contactWrap}>
      <Avatar.Image
        source={hasImg?{uri:'file://'+uri}:require('../../../../assets/avatar.png')}
        size={32}
      />
      <View style={styles.contactAliasWrap}>
        <Text style={styles.contactAliasLabel}>{ui.payMode==='invoice'?'From':'To'}</Text>
        <Text>{contact.alias}</Text>
      </View>
   </View>}

    <View style={styles.amtWrap}>
      <View style={styles.amtInnerWrap}>
        <Text style={styles.amt}>{amt}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
    </View>

    <View style={styles.bottom}>
      <View style={styles.confirmWrap}>
        {amt&&amt!=='0'&&<Button style={styles.confirm}
          loading={loading}
          onPress={()=> confirmOrContinue(parseInt(amt),text)}
          mode="contained" dark={true}>
          {contactless?'CONTINUE':'CONFIRM'}
        </Button>}
      </View>

      <NumKey onKeyPress={v=> go(v)} onBackspace={()=> backspace()} 
        squish
      />

      {ui.payMode==='invoice' && <View style={styles.memoWrap}>
        <TextInput value={text} placeholder="Add Message"
          onChangeText={v=> setText(v)}
          style={{...styles.input,
            borderBottomColor:inputFocused?'#6289FD':'#ddd'
          }}
          onFocus={()=> setInputFocused(true)}
          onBlur={()=> setInputFocused(false)}
        />
      </View>}
    </View>

  </View>
}

const styles=StyleSheet.create({
  wrap:{
    flex:1,
    width:'100%',
  },
  contactWrap:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:5,
  },
  contactAliasWrap:{
    marginLeft:10,
    display:'flex',
    flexDirection:'column',
  },
  contactAliasLabel:{
    color:'#ccc',
    fontSize:11
  },
  amtWrap:{
    width:'100%',
    display:'flex',
    marginBottom:11,
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
  },
  amtInnerWrap:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    position:'relative',
  },
  amt:{
    fontSize:45,
    color:'black',
  },
  sat:{
    position:'absolute',
    right:25,
    fontSize:23,
    color:'#ccc',
  },
  confirmWrap:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    height:80,
    marginTop:12,
  },
  confirm:{
    backgroundColor:'#6289FD',
    height:35,
    width:150,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
  },
  memoWrap:{
    width:'80%',
    marginLeft:'10%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10,
  },
  input:{
    height:42,
    maxHeight:42,
    flex:1,
    marginBottom:5,
    backgroundColor:'#fff',
    textAlign:'center',
    borderBottomWidth:1,
    fontSize:16
  },
  bottom:{
    width:'100%',
    flex:1,
    maxHeight:390,
    flexDirection:'column-reverse',
  },
})