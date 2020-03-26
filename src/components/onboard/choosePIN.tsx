import React from 'react'
import {useObserver} from 'mobx-react-lite'
import Slider from '../utils/slider'
import PIN from '../utils/pin'

export default function ChoosePIN(props) {
  const {onDone,z,show}=props
  return useObserver(()=> <Slider z={z} show={show}>
    <PIN mode="choose" onFinish={onDone} />
  </Slider>)
}

