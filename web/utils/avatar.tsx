import React from 'react'
import styled from 'styled-components'

const colorz=["#FF70E9","#7077FF","#DBD23C","#F57D25","#9F70FF","#9BC351","#FF3D3D","#C770FF","#62C784","#C99966","#76D6CA","#ABDB50","#FF708B","#5AD7F7","#5FC455","#FF9270","#3FABFF","#56D978","#FFBA70","#5078F2","#618AFF"]

export default function Avatar(props){
  console.log(props)
  const name = props.alias||'Sphinx'
  const photo = props.photo
  const size = props.big?48:42
  const borderRadius = size/2
  let initial = ''
  const arr = name.split(' ')
  arr.forEach((str,i)=>{
    if(i<2) initial+=str.substring(0,1).toUpperCase()
  })
  if (photo) {
    return <Wrap style={{height:size, width:size, borderRadius, opacity:props.hide?0:1}}>
      <Img src={photo} style={{width:size,height:size}} />
    </Wrap>
  }
  return <Wrap style={{
    height:size, width:size, borderRadius,
    opacity:props.hide?0:1,
    backgroundColor:getColor(name)
    }}>
    <Initial style={{
      letterSpacing:props.big?2:0,
      fontSize:props.big?18:15
      }}>
      {initial}
    </Initial>
  </Wrap>
}

export function getColor(s){
  const hc = hashCode(s.repeat(Math.round(32/s.length)))
  const int = Math.round(Math.abs(
    hc/2147483647*colorz.length
  ))
  return colorz[Math.min(int,20)]
}

function hashCode(str){
  var hash = 0;
  if (str.length == 0) return hash;
  for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const Wrap = styled.div`
  margin-left:8px;
  background-color:black;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
`
const Img = styled.div`
  background-image: url(${p=>p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
`
const Initial = styled.div`
  color:white;
`
