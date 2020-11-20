import React, {useState} from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import littleFireword from '../../../src/animations/little-firework.json'
import Lottie from 'react-lottie';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment'

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
    <Box style={{borderColor:theme.active,color:theme.active}}
      onMouseEnter={popoverOpen} onMouseLeave={popoverClose}>
      {`${props.boosts_total_sats} sats`}
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
          const name = b.sender===1?'Me':b.sender_alias
          return <Booster>
            <span>{`${name}: ${b.amount}`}</span>
            <span>{moment(b.date).format('ddd hh:mm')}</span>
          </Booster>
        })}
      </InnerPop>
    </Popover>
  </Wrap>
}

const Wrap = styled.div`
  display:flex;
  max-height:24px;
  align-items:center;
  margin:2px 0;
  position:relative;
`
const Box = styled.div`
  border-width:1px;
  border-style:solid;
  border-radius:4px;
  height:18px;
  font-size:10px;
  padding:2px 7px;
  background:rgba(255,255,255,0.1);
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