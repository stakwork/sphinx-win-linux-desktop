import 'react-native-get-random-values'
import React from 'react'
import {View,StyleSheet,Dimensions} from 'react-native'
import {WebView} from 'react-native-webview'
import qrious from '../../utils/qrcode/qrious'

function makeScript(value, size){
  return`
<style>
*{margin:0;padding:0;box-sizing:border-box;}
canvas{transform:translateZ(0);width:${size}px;height:${size}px;}
</style>
<canvas id="qr"></canvas>
<script>
${qrious}
var qr = new QRious({
  element: document.getElementById('qr'),
  value: '${value}',
  size: ${size}
});
</script>
`
}

export default function QRCode(){
  const {width,height} = Dimensions.get('window')
  var w = width||340
  var h = height-20||500
  return (
    <View style={styles.wrap}>
      <Canvas
        value={"hello"}
        style={{height:h, width:w, minWidth:w, minHeight:h}}
      />
    </View>
  )
}

function Canvas(props) {
  return (<View style={props.style}>
    <WebView
      automaticallyAdjustContentInsets={false}
      injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=no'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);`}
      scalesPageToFit={true}
      contentInset={{top: 0, right: 0, bottom: 0, left: 0}}
      source={{uri:'https://memes.sphinx.chat/ion?room=hi&name=Evan'}}
      // source={{uri:'https://rtc.sphinx.chat:8080/?room=hi'}}
      style={{...props.style, resizeMode: 'cover', flex: 1}}
      javaScriptEnabled={true}
      scrollEnabled={false}
      originWhitelist={['*']}
    />
  </View>)
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    position:'absolute',
    top:0,left:0,bottom:0,right:0,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'black'
  },
})