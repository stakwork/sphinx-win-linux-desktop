import React from 'react'
import TextInput from './textInput'
import QrInput from './qrInput'
import Photo from './photo'
import Tags from './tags'
import Number from './number'
import PhotoURI from './photoURI'

export default function Input(props){
  switch (props.type) {
    case 'text':
      return <TextInput {...props} />
    case 'pubkey':
      return <QrInput {...props} />
    case 'photo':
      return <Photo {...props} />
    case 'tags':
      return <Tags {...props} />
    case 'number':
      return <Number {...props} />
    case 'photoURI':
      return <PhotoURI {...props} />
    default:
      return <TextInput {...props} />
  }
}
