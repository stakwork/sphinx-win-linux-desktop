import { StyleSheet } from 'react-native'

export default StyleSheet.create({
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