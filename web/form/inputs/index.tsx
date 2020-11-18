import React from 'react'
import TextInput from './textinput'
import TextAreaInput from './textareainput'

export default function Input(props){
    switch(props.type){
        case 'text':
            return <TextInput {...props}/>
        case 'textArea':
            return <TextAreaInput {...props}/>
        default:
            return <TextInput {...props}/>
    }
}