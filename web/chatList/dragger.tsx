import React, {useState} from 'react'
import {DraggableCore} from 'react-draggable'
import styled from 'styled-components'

function Dragger({setWidth,maxWidth}){
  return <DraggableCore
    onDrag={(e:any)=>{
      if(e.x>=250 && e.x<=maxWidth) setWidth(e.x)
    }}>
    <Handle>
      <Circle />
    </Handle>
  </DraggableCore>
}

const Handle=styled.div`
  background:#252525;
  width:11px;
  height:100%;
  cursor:col-resize;
  border-left-width:1px;
  border-right-width:1px;
  border-color:#141a22;
  border-style:solid;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  position:relative;
  z-index:12;
`
const Circle=styled.div`
  width:5px;
  height:5px;
  border-radius:100%;
  background:#373737;
`

export default Dragger