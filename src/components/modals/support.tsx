import React, {useState, useEffect} from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores } from '../../store'
import {View, Text, StyleSheet, TextInput, ScrollView, Clipboard, Linking} from 'react-native'
import {Button, Portal, ActivityIndicator, Snackbar} from 'react-native-paper'
import ModalWrap from './modalWrap'
import Header from './modalHeader'

export default function Support({visible}) {
  const { ui, details } = useStores()
  const [loading,setLoading] = useState(true)
  const [text,setText] = useState('')
  const [copied,setCopied] = useState(false)
  function close(){
    ui.setSupportModal(false)
  }

  async function loadLogs(){
    setLoading(true)
    await details.getLogs()
    setLoading(false)
  }

  function copy(){
    Clipboard.setString(details.logs)
    setCopied(true)
  }

  function email(){
    let body = text?`${text}<br/><br/>`:''
    body += details.logs.replace(/(\n)/g, '<br/>')
    const subject = 'Sphinx Support Request'
    Linking.openURL(`mailto:support@sphinx.chat?subject=${subject}&body=${body}`)
  }

  useEffect(()=>{
    if(visible) loadLogs()
    else details.clearLogs()
  },[visible])

  return useObserver(() => <ModalWrap onClose={close} visible={visible}
    noSwipe>
    <Portal.Host>
      <Header title="Support" onClose={()=>close()} />

      <View style={styles.modal}>
        <TextInput numberOfLines={4}
          textAlignVertical="top"
          multiline={true}
          placeholder="Describe your problem here..."
          onChangeText={e=> setText(e)}
          value={text} blurOnSubmit={true}
          style={styles.input}
        />
        {!loading && <ScrollView style={styles.logsScroller}>
          <Text style={styles.logs}>
            {details.logs}
          </Text>
        </ScrollView>}
        {loading && <View style={styles.spinWrap}>
          <ActivityIndicator animating={true} color="grey" />
        </View>}
        <View style={styles.buttonWrap}>
          <Button mode="contained" disabled={!details.logs}
            onPress={()=>email()} 
            dark={true} style={styles.button}>
            Send Message
          </Button>
          <Button mode="contained" disabled={!details.logs}
            onPress={()=>copy()} 
            dark={true} style={styles.button}>
            Copy Logs
          </Button>
        </View>
      </View>
      <Snackbar
        visible={copied}
        onDismiss={()=> setCopied(false)}>
        Logs Copied
      </Snackbar>
    </Portal.Host>
  </ModalWrap>)
}

const styles = StyleSheet.create({
  modal:{
    margin:0,
    paddingTop:20,
    display:'flex',
    flex:1,
    flexDirection:'column',
    alignItems:'center'
  },
  buttonWrap:{
    width:'100%',
    maxHeight:60,
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
    marginTop:40
  },
  button:{
    borderRadius:30,
    width:150,
    height:50,
    display:'flex',
    justifyContent:'center',
    zIndex:999,
    position:'relative',
    marginBottom:40,
  },
  input:{
    flex:1,
    borderRadius:12,
    borderColor:'#ccc',
    backgroundColor:'white',
    paddingLeft:18,
    paddingRight:18,
    borderWidth:1,
    fontSize:13,
    lineHeight:20,
    minHeight:100,
    maxHeight:100,
    width:'90%',
  },
  logsScroller:{
    flex:1,
    minHeight:100,
    padding:15,
  },
  logs:{
    fontFamily:'monospace',
    fontSize:11,
  },
  spinWrap:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  }
})