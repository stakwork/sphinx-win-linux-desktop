import React from 'react'
import {parseLDAT} from '../../utils/ldat'

export default function MediaMsg(props){
  const {message_content} = props
  const ldat = parseLDAT(props.media_token)
  console.log(ldat)
  return <div>{message_content}</div>
}