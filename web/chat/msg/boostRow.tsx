import React, {useState} from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import littleFireword from '../../../src/animations/little-firework.json'
import Lottie from 'react-lottie';
import moment from 'moment'
import {BoostIcon} from '../pod/icons'
import AvatarsRow from '../../utils/avatarsRow'

// https://lottiefiles.com/3074-fireworks

const lottieOptions = {
  loop: false,
  autoplay: true, 
  animationData: littleFireword,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

export default function BoostRow(props){
  const {boosts,boosts_total_sats,isMe,myid} = props

  const bg = isMe ? theme.highlight : theme.extraDeep

  const [anim,setAnim] = useState(false)
  function play() {
    return
    requestAnimationFrame(async () => {
      setAnim(true)
      await sleep(660)
      setAnim(false)
    })
  }

  let fromText
  const showAvatars = boosts && boosts.length>1
  if(showAvatars) {
    if(boosts.length>3) fromText = `+${boosts.length-3}`
  } else {
    fromText = boosts && boosts.length && (boosts[0].sender===myid?'Me':boosts[0].sender_alias)
  }
  return <Wrap onClick={play}>
    <LottieWrap>
      {anim && <Lottie options={lottieOptions}
        height={100}
        width={100}
      />}
    </LottieWrap>
    <Box>
      <BoxLeft>
        <Boost />
        <BoxText>{boosts_total_sats}</BoxText>
        <BoxSatsText>sats</BoxSatsText>
      </BoxLeft>
      <BoxRight>
        {showAvatars && <Avatars>
          <AvatarsRow aliases={boosts.map(b=>b.sender_alias)} borderColor={bg} />
        </Avatars>}
        {(fromText?true:false) && <FromText>{fromText}</FromText>}
      </BoxRight>
    </Box>
  </Wrap>
}

function Boost(){
  return <BoostGreen>
    <BoostIcon style={{height:20,width:20}} />
  </BoostGreen>
}
const BoostGreen = styled.div`
  background:#48c998;
  height:18px;
  width:18px;
  border-radius:3px;
  display:flex;
  align-items:center;
  justify-content:center;
`

const Wrap = styled.div`
  display:flex;
  max-height:24px;
  align-items:center;
  margin:2px 0;
  position:relative;
`
const Box = styled.div`
  border-radius:4px;
  height:19px;
  font-size:11px;
  display:flex;
  align-items:center;
  margin-top:7px;
  justify-content:space-between;
  width:100%;
`
const BoxLeft = styled.div`
  display:flex;
  align-items:center;
`
const BoxRight = styled.div`
  display:flex;
  align-items:center;
  color:#bbb;
`
const BoxText = styled.div`
  margin-left:8px;
`
const BoxSatsText = styled.div`
  margin-left:3px;
  color:grey;
`
const LottieWrap = styled.div`
  position:absolute;
  top:-42px;
  left:24px;
`
const Avatars = styled.div`
  display:flex;
  align-items:center;
`
const FromText = styled.div`
  display:flex;
  align-items:center;
  margin-left:5px;
`
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}