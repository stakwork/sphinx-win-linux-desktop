import React, { useEffect, useState } from 'react'
import { parseLDAT } from '../../../src/store/utils/ldat'
import { useCachedEncryptedFile } from './hooks'
import { useStores } from '../../../src/store'
import styled from 'styled-components'
import theme from '../../theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import CallMadeIcon from '@material-ui/icons/CallMade';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CheckIcon from '@material-ui/icons/Check'
import CamIcon from '@material-ui/icons/CameraAltOutlined'
import GetAppIcon from '@material-ui/icons/GetApp';
import ReactAudioPlayer from 'react-audio-player'
import { Player } from 'video-react';
import BoostRow from './boostRow'
import Dialog from '@material-ui/core/Dialog';
import Button from "../../utils/button";


export default function MediaMsg(props) {
  const { msg, ui } = useStores()
  const [buying, setBuying] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const { message_content, chat, media_token, media_type, boosts_total_sats } = props
  const isMe = props.sender === props.myid

  const ldat = parseLDAT(media_token)

  let amt = null
  let purchased = false
  if (ldat.meta && ldat.meta.amt) {
    amt = ldat.meta.amt
    if (ldat.sig) purchased = true
  }
  const needsPurchase = amt && !purchased

  const { data, loading, trigger, paidMessageText, filename } = useCachedEncryptedFile(props, ldat)

  let showPayToUnlockMessage = false
  let isPaidMsg = false
  if (media_type === 'sphinx/text') {
    isPaidMsg = true
    if (!isMe && !loading && !paidMessageText) showPayToUnlockMessage = true
  }

  useEffect(() => {
    trigger()
  }, [props.media_token])

  async function buy(amount) {
    if (purchased) return
    setBuying(true)
    let contact_id = props.sender
    if (!contact_id) {
      contact_id = chat.contact_ids && chat.contact_ids.find(cid => cid !== props.myid)
    }
    setConfirm(false)
    await msg.purchaseMedia({
      chat_id: chat.id,
      media_token,
      amount,
      contact_id,
    })
    setBuying(false)
  }

  const hasContent = message_content ? true : false
  const showPurchaseButton = amt && !isMe ? true : false
  const showStats = isMe && amt
  const sold = props.sold

  return <Wrap>
    {/* {loading &&
      <CircularProgress size={17} style={{color:'white'}} />
    } */}

    {amt && showStats && <PriceWrap>
      <PriceIcon theme={theme}>
        {amt} SAT
      </PriceIcon>
      <PriceIcon theme={theme}>
        {sold ? 'Purchase Succeeded' : 'Pending'}
      </PriceIcon>
    </PriceWrap>}

    {needsPurchase && !isPaidMsg ?
      <NeedsPurchase>
        <CamIcon style={{ color: 'grey', fontSize: 30 }} />
      </NeedsPurchase> :
      <Media type={media_type} data={data} filename={filename} onClick={() => ui.setImgViewerParams({ data, type: media_type })} />
    }
    {message_content && <Content>
      {message_content}
    </Content>}

    {isPaidMsg && <>
      {showPayToUnlockMessage && <Content>
        Pay to unlock message
      </Content>}
      {loading && <LoadingWrap>
        <CircularProgress size={17} style={{ color: 'white' }} />
      </LoadingWrap>}
      {paidMessageText && <Content style={{paddingTop: 40}}>
        {paidMessageText}
      </Content>}
    </>}

    {showPurchaseButton && <BuyButton style={{ background: theme.primary }}
      onClick={() => setConfirm(true)} purchased={purchased}>
      <BuyIcon purchased={purchased} loading={buying} />
      <BuyText>{purchased ? 'Purchased' : `Pay ${amt} sat`}</BuyText>
    </BuyButton>}

    <Dialog onClose={()=>setConfirm(false)} open={confirm}>
        <DialogContent>
          <div style={{marginBottom:10}}>Confirm Purchase?</div>
          <Button color={"primary"} onClick={()=>setConfirm(false)}>Cancel</Button>
          <Button color={"secondary"} onClick={()=>buy(amt)}>Yes</Button>
        </DialogContent>
      </Dialog>

    {boosts_total_sats && <BoostRowWrap>
      <BoostRow {...props} isMe={isMe} />
    </BoostRowWrap>}
  </Wrap>
}

function BuyIcon({ purchased, loading }) {
  if (loading) return <CircularProgress size={15} style={{ color: 'white' }} />
  if (purchased) return <CheckIcon style={{ color: 'white', fontSize: 15 }} />
  return <CallMadeIcon style={{ color: 'white', fontSize: 15 }} />
}

function Media({ type, data, onClick, filename }) {
  // console.log(type,data)
  const typ = type || 'sphinx/text'
  if (typ === 'sphinx/text') return <></>
  if (typ.startsWith('image')) {
    return <Image src={data} onClick={onClick} />
  }
  if (typ.startsWith('audio')) {
    return <ReactAudioPlayer src={data} controls />
  }
  if (typ.startsWith('video')) {
    return <VidWrap>
      <Player><source
        src={data}
        type={type === 'video/mov'||type==='video/quicktime' ? 'video/mp4' : type}
      /></Player>
      <PlayArrow onClick={onClick}>
        <PlayArrowIcon style={{ fontSize: 34 }} />
      </PlayArrow>
      <VidOverlay />
    </VidWrap>
  }

  return <>
    <Download src={data} filename={filename} onClick={() => download(data, filename)}>
      <span>Download file: {filename || "Attachment"}</span>
      <GetAppIcon style={{ marginLeft: 10 }} />
    </Download>
  </>
}

function download(dataURL, filename) {
  var a = document.createElement("a");
  a.download = filename || "file";
  a.href = dataURL;
  document.body.appendChild(a);
  a.click();
}

const Wrap = styled.div`
  min-width:240px;
  position: relative;
`
const PriceWrap = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 0px;
  width: 100%;
`

const Download = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 13px;
  padding: 0px 15px;
  max-width: 300px;
  cursor: pointer;
  & span{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const Image = styled.div`
  width:240px;
  height:270px;
  background-image:url(${p => p.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size:cover;
  cursor:pointer;
`
const Content = styled.div`
  color:white;
  max-width:240px;
  padding:16px;
`
const LoadingWrap = styled.div`
  color:white;
  max-width:240px;
  padding:16px;
  text-align:center;
`
const BuyButton = styled.div`
  color:white;
  height:40px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  position: relative;
  ${p => !p.purchased &&
    `cursor: pointer;
    &:hover{
      background:#5b83f4 !important;
    }`
  }
`
const BuyText = styled.div`
  margin-left:10px;
`
const NeedsPurchase = styled.div`
  width:240px;
  height:270px;
  display:flex;
  align-items:center;
  justify-content:center;
`
const VidWrap = styled.div`
  display:flex;
  flex:1;
  align-items:center;
  justify-content:center;
  position: relative;
  & .video-react-big-play-button{
    display:none;
  }
`
const VidOverlay = styled.div`
  position:absolute;
  z-index:101;
  left:0;right:0;top:0;bottom:0;
  background-color:rgba(0,0,0,0.4);
`
const PlayArrow = styled.div`
  z-index:102;
  border:6px solid #ccc;
  cursor:pointer;
  border-radius:100%;
  height:48px;
  width:48px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color:white;
  }
  & svg {
    fill:#ccc;
  }
  &:hover svg {
    fill:white;
  }
`
const PriceIcon = styled.div`
  position: relative;
  color: white;
  background-color: ${p => p.theme.secondary};
  font-size: 10px;
  font-weight: bold;
  height: 20px;
  border-radius: 5px;
  padding: 4px 8px;
`

const BoostRowWrap = styled.div`
  padding:4px 12px 10px 12px;
`

const DialogContent = styled.div`
  display:flex;
  flex-direction:column;
  justify-content: space-between;
  padding:30px;
  height: 200px;
`