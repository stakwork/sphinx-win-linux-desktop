import React from 'react'

export default function TextMsg(props){
  const {message_content} = props
  return <div>{message_content}</div>
}