import React, {useState} from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import littleFireword from '../../../src/animations/little-firework.json'
import Lottie from 'react-lottie';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment'
import {BoostIcon} from '../pod/icons'

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
}));

// https://lottiefiles.com/3074-fireworks

const lottieOptions = {
  loop: false,
  autoplay: true, 
  animationData: littleFireword,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

export default function BoostSats(props){
  const classes = useStyles();

  const [anim,setAnim] = useState(false)
  function play() {
    requestAnimationFrame(async () => {
      setAnim(true)
      await sleep(660)
      setAnim(false)
    })
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const popoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return <Wrap onClick={play}>
    <LottieWrap>
      {anim && <Lottie options={lottieOptions}
        height={100}
        width={100}
      />}
    </LottieWrap>
    <Box onMouseEnter={popoverOpen} onMouseLeave={popoverClose}>
      <Boost />
      <BoxText>{props.boosts_total_sats}</BoxText>
      <BoxSatsText>sats</BoxSatsText>
    </Box>
    <Popover
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        style: {
          backgroundColor: theme.extraDeep
        },
      }}
      onClose={popoverClose}
      disableRestoreFocus
    >
      <InnerPop>
        <PopTitle>Boosters:</PopTitle>
        {props.boosts && props.boosts.map(b=>{
          const name = b.sender===props.myid?'Me':b.sender_alias
          return <Booster>
            <span>{`${name}: ${b.amount}`}</span>
            <span>{moment(b.date).format('ddd hh:mm')}</span>
          </Booster>
        })}
      </InnerPop>
    </Popover>
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
const InnerPop = styled.div`
  display:flex;
  flex-direction:column;
  width:180px;
  height:180px;
  color:white;
  padding:13px;
`
const PopTitle = styled.div`
  color:white;
  font-size:13px;
  margin-bottom:5px;
`
const Booster = styled.div`
  display:flex;
  align-items:center;
  min-height:15px;
  font-size:11px;
  width:100%;
  justify-content:space-between;
`

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}