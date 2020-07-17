import React from 'react'
import styled from 'styled-components'
import IconButton from '@material-ui/core/IconButton';
import BackspaceIcon from '@material-ui/icons/Backspace';

const keys = [
  [1,2,3],[4,5,6],[7,8,9],['_',0,'back']
]

export default function NumKey(props) {
  const h = props.squish?240:260
  return <Wrap style={{
      height:h, maxHeight:h, minHeight:h,
      backgroundColor: props.dark?'#212932':'white'
    }}>
    {keys.map((row,i)=>{
      return <Row key={i}>
        {row.map(key=>{
          if(key==='_') return <div key={key} style={{width:'33.33%'}}/>
          if(key==='back'){
            return <BackWrap key={key}
              onClick={()=>{
                if(props.onBackspace) props.onBackspace()
              }}>
              <IconButton>
                <BackspaceIcon style={{color:props.dark?'white':'#AAA'}} />
              </IconButton>
            </BackWrap>
          }
          return <Key key={key}>
            <IconButton style={{width:52,height:52}}
              onClick={()=>{
                if(props.onKeyPress) props.onKeyPress(key)
              }}>
              <KeyText style={{color:props.dark?'white':'#777'}}>
                {key}
              </KeyText>
            </IconButton>
          </Key>
        })}
      </Row>
    })}
  </Wrap>
}

const Wrap = styled.div`
  flex:1;
  display:flex;
  width:100%;
  flex-direction:column;
`
const Row = styled.div`
  width:100%;
  display:flex;
  flex-direction:row;
  height:25%;
`
const Key = styled.div`
  width:33.33%;
  display:flex;
  flex:1;
  align-items:center;
  justify-content:center;
  cursor:pointer;
`
const KeyText = styled.div`
  font-size:24px;
  font-weight:bold;
`
const BackWrap = styled.div`
  width:33.33%;
  display:flex;
  flex:1;
  align-items:center;
  justify-content:center;
`

