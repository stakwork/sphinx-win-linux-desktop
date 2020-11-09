import React from 'react'
import TextInput from './textinput'


export default function Input(props){
    switch(props.type){
        case 'text':
            return <TextInput {...props}/>
        default:
            return <TextInput {...props}/>
    }
}