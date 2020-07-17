import React from 'react'
import Modal from '@material-ui/core/Modal';
import moment from 'moment'
import styled from 'styled-components'

const ns = [1,2,3,4,5,6]

function PIN({onFinish}){
  return <Modal
    open={true}
    onClose={()=>{}}
    aria-labelledby="pin-number"
    aria-describedby="enter-your-pin-number"
    className="modal-wrap"
  >
    <Center>hi</Center>
  </Modal>
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

const Center = styled.div`
  border:1px solid grey;
  border-radius:10px;
  width:380px;
  height:450px;
`

export default PIN