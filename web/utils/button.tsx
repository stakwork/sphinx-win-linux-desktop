import React from 'react'
import Button from '@material-ui/core/Button';

export default function B(props){
  const {children,onClick,disabled,color} = props
  return <Button variant="contained" size="large" 
    disabled={disabled} onClick={onClick} color={color||'default'}
    style={{borderRadius:20}}>
    {children}
  </Button>
}