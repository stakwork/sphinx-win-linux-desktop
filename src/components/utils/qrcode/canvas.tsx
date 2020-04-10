
import React from 'react'
import {View} from 'react-native'
import {WebView} from 'react-native-webview'
import qrious from './qrious'

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

export default function Canvas(props) {
  return (<View style={props.style}>
    <WebView
      automaticallyAdjustContentInsets={false}
      injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=no'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);`}
      scalesPageToFit={true}
      contentInset={{top: 0, right: 0, bottom: 0, left: 0}}
      source={{html: makeScript(props.value, props.size)}}
      style={{...props.style, resizeMode: 'cover', flex: 1}}
      javaScriptEnabled={true}
      scrollEnabled={false}
      originWhitelist={['*']}
    />
  </View>)
}
