import React from 'react'
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function B(props) {
  const { children, onClick, disabled, color, loading } = props
  const style = props.style || {}
  return <Button variant="contained" size="large"
    disabled={disabled} onClick={onClick} color={color || 'default'}
    style={{ borderRadius: 20, display: 'flex', alignItems: 'center', justifyContents: 'center', ...style }}>
    {loading && <CircularProgress size={18} style={{ color: 'white', marginRight: 10 }} />}
    <span>{children}</span>
  </Button>
}