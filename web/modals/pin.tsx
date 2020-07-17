import React, {useState, useEffect} from 'react'
import Modal from '@material-ui/core/Modal';
import moment from 'moment'
import styled from 'styled-components'
import NumKey from '../utils/numkey'
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';

const ns = [1,2,3,4,5,6]
function PIN(props){
  const [pin, setPin] = useState('')
  const [chosenPin, setChosenPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [err, setErr] = useState(false)
  const [mode,setMode] = useState('choose')

  useEffect(()=>{
    (async () => {
      if(props.forceEnterMode) {
        setMode('enter')
        return
      }
      const storedPin = localStorage.getItem('pin')
      if(storedPin) setMode('enter')
    })()
  },[])

  async function check(thePin){
    if(props.forceEnterMode) {
      setChecking(true)
      return props.onFinish(thePin)
    }
    if(mode==='choose') {
      if(chosenPin){
        if(thePin===chosenPin){ // success!
          setChecking(true)
          await setPinCode(thePin)
          props.onFinish()
        } else {
          setErr(true)
          setPin('')
          setChosenPin('')
        }
      } else {
        setChosenPin(thePin)
        setPin('')
      }
    }
    if(mode==='enter') {
      setChecking(true)
      try {
        const storedPin = localStorage.getItem('pin')
        if(storedPin===thePin){
          localStorage.setItem('pin_entered', ts())
          props.onFinish()
        } else {
          setErr(true)
          setPin('')
          setChecking(false)
        }
      } catch(e){}
    } 
  }
  function go(v){
    const newPin = pin+v
    if(err) setErr(false)
    setPin(newPin)
    if(newPin.length===6){
      check(newPin)
    }
  }
  function backspace(){
    const newPin = pin.substr(0, pin.length-1)
    setPin(newPin)
  }

  let txt = 'ENTER PIN'
  if(mode==='choose') {
    txt='CHOOSE PIN'
    if(chosenPin) txt='CONFIRM PIN'
  }
  if(err) txt='TRY AGAIN!'

  return <Modal
    open={true}
    onClose={()=>{}}
    aria-labelledby="pin-number"
    aria-describedby="enter-your-pin-number"
    className="modal-wrap"
  ><Center>
    <Top>
      <LockWrap>
        <LockIcon style={{fontSize:18}} />
        <ChooseTxt>{txt}</ChooseTxt>
      </LockWrap>
      <Circles>
        {ns.map(n=> <div key={n} style={{
          backgroundColor:pin.length>=n?'white':'transparent',
          height:25, width:25, borderRadius:13, borderStyle:'solid',
          marginLeft:10,marginRight:10,
          borderWidth:1, borderColor:'white'
        }}/> )}
      </Circles>
      <SpinWrap>
        {checking && <CircularProgress style={{color:'white'}} size={16} />}
      </SpinWrap>
    </Top>
    <NumKey onKeyPress={v=> go(v)} dark={true} 
      onBackspace={()=> backspace()}
    />
  </Center></Modal>
}

export async function userPinCode(): Promise<string> {
  const pin = localStorage.getItem('pin')
  return pin || ''
}

export async function setPinCode(pin): Promise<any> {
  localStorage.setItem('pin_entered', ts())
  localStorage.setItem('pin', pin)
}

const MINUTES = 720 // 12 hours
export async function wasEnteredRecently(): Promise<boolean> {
  const now = moment().unix()
  const enteredAtStr = await localStorage.getItem('pin_entered')
  const enteredAt = parseInt(enteredAtStr)
  if(!enteredAt){
    return false
  }
  if(now < enteredAt+(60*MINUTES)) { // five minutes
    return true
  }
  return false
}

function ts(){
  return moment().unix()+''
}

const Center = styled.div`
  border:1px solid #444;
  border-radius:6px;
  width:385px;
  height:550px;
  box-shadow: 0px 0px 17px 0px rgba(0,0,0,0.75);
  background:#6681fe;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  overflow:hidden;
`
const Top = styled.div`
  display:flex;
  flex:1;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  margin-bottom:42px;
`
const LockWrap = styled.div`
  display:flex;
  flex-direction:column;
  flex:1;
  align-items:center;
  justify-content:center;
`
const ChooseTxt = styled.div`
  color:white;
  font-weight:bold;
  font-size:16px;
  margin-top:20px;
`
const Circles = styled.div`
  width:100%;
  display:flex;
  margin-bottom:52px;
  flex-direction:row;
  justify-content:center;
  align-items:center;
`
const SpinWrap = styled.div`
  height:20px;
`

export default PIN