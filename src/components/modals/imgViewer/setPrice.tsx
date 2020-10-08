import React, {useState, useRef} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useTheme } from '../../../store'
import {View, StyleSheet,Text,TouchableOpacity} from 'react-native'
import NumKey from '../../utils/numkey'
import {Button} from 'react-native-paper'

export default function SetPrice({setAmount,onShow}) {
  const theme = useTheme()
  const [price, setPrice] = useState('SET PRICE')
  const [showNum, setShowNum] = useState(false)
  const [amt, setAmt] = useState('0')

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
  function open(){
    onShow()
    setShowNum(true)
  }
  return useObserver(() => <>
    <TouchableOpacity style={styles.priceButton} onPress={open}>
      <Text style={styles.priceTxt}>{price}</Text>
    </TouchableOpacity> 

    {showNum && <View style={{...styles.num,backgroundColor:theme.main}}>
      <View style={styles.amtWrap}>
        <Text style={{...styles.amt,color:theme.title}}>{amt}</Text>
        <Text style={styles.sat}>sat</Text>
      </View>
      <NumKey onKeyPress={v=> go(v)} onBackspace={()=> backspace()} 
        squish
      />
      <View style={{...styles.confirmWrap,opacity:(amt&&amt!=='0'?1:0)}}>
        <Button style={styles.confirm}
          onPress={()=> {
            setPrice(`${amt} sat`)
            setShowNum(false)
            setAmount(parseInt(amt))
          }}
          mode="contained" dark={true}>
          CONFIRM
        </Button>
      </View>
    </View>}
  </>)
}

const styles = StyleSheet.create({
  priceButton:{
    position:'absolute',
    top:90,right:10,
    height:32,minWidth:90,
    backgroundColor:'#55D1A9',
    zIndex:999,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:5,
  },
  priceTxt:{
    color:'white',
    fontWeight:'bold',
    fontSize:13,
  },
  num:{
    borderRadius:10,
    width:240,
    height:400,
    position:'absolute',
    top:140,
    right:10,
    zIndex:999,
    display:'flex',
    justifyContent:'space-around',
    alignItems:'center',
    paddingTop:14,
    paddingBottom:14,
  },
  amtWrap:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    position:'relative',
  },
  amt:{
    fontSize:37,
  },
  sat:{
    position:'absolute',
    right:28,top:15,
    color:'#bbb'
  },
  confirmWrap:{
    width:'100%',
    flexDirection:'row',
    justifyContent:'center',
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
  }
})