import React, {useEffect,useState} from 'react'
import styled from 'styled-components'
import Lottie from 'react-lottie';
import confetti from '../../src/animations/confetti.json'
import EE, { PLAY_ANIMATION } from '../utils/ee'
import { useStores } from '../../src/store'

const lens = { // min 1000
  confetti: {
    time: 3000
  }
}

export default function Animation(){
  const {contacts} = useStores()
  const [show,setShow] = useState(false)

  const meContact = contacts.contacts.find(c => c.id === 1)
  let meIMG = meContact && meContact.photo_url

  function play() {
    const name = 'confetti'
    const len = lens[name].time
    requestAnimationFrame(async () => {
      setShow(true)
      await sleep(len)
      setShow(false)
    })
  }
  useEffect(() => {
    EE.on(PLAY_ANIMATION, play)
    return () => {
      EE.removeListener(PLAY_ANIMATION, play)
    }
  }, [])

  const defaultOptions = {
    loop: false,
    autoplay: true, 
    animationData: confetti,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  return <Wrap show={show}>
    <Backdrop />
    <ContentWrap>
      {show && <Lottie options={defaultOptions}
        height={400}
        width={400}
      />}
      {meIMG && <Img src={meIMG} />}
    </ContentWrap>
  </Wrap>
}

interface WrapProps {
  show: boolean
}
const Wrap = styled.div<WrapProps>`
  pointer-events:none;
  transition:opacity 0.2s;
  opacity:${p=>p.show?1:0};
  position:absolute;
  top:0;left:0;right:0;bottom:0;
  z-index:101;
  display:flex;
  align-items:center;
  justify-content:center;
`
const Backdrop = styled.div`
  background:rgba(0,0,0,0.7);
  position:absolute;
  top:0;left:0;right:0;bottom:0;
`
const ContentWrap = styled.div`
  height:400px;
  width:400px;
  max-width:400px;
  max-height:400px;
  border-radius:100%;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
`
const Img = styled.div`
  height:80px;
  width:80px;
  background-image:url(${p => p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  border-radius:100%;
  position:absolute;
  top:160px;
  left:160px;
`

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}