
import React from 'react'
import Canvas from './canvas'
import {View} from 'react-native'

export default function QRCode(props){

    function utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            }
        }
        return out;
    }

    var size = props.size
    var value = utf16to8(props.value)
    return (
        <View style={{height: size, width: size, minWidth:size, minHeight:size, backgroundColor:'blue'}}>
            <Canvas
                value={value}
                size={size}
                style={{height: size, width: size, minWidth:size, minHeight:size}}
            />
        </View>
    )
}

