import React from 'react'
import TextInput from './textInput'
import QrInput from './qrInput'
import Photo from './photo'

export default function Input(props){
  switch (props.type) {
    case 'text':
      return <TextInput {...props} />
    case 'pubkey':
      return <QrInput {...props} />
    case 'photo':
      return <Photo {...props} />
    default:
      return <TextInput {...props} />
  }
}
