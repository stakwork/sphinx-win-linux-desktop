import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  refreshingWrap:{
    position:'absolute',
    zIndex:102,
    top:55,
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden'
  },
  refreshingCircle:{
    height:42,width:42,
    borderRadius:25,
    backgroundColor:'white',
    borderWidth:1,
    borderColor:'#ddd',
    borderStyle:'solid',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
  }
})