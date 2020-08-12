import React from 'react'

export default function Frame({url}){
  return <iframe frameBorder="0" src={url} style={{
    height:'100%',flex:1,width:'100%'
  }}></iframe>
}
