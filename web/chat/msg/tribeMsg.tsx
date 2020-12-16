import React, { useEffect, useState } from 'react'
import { useStores } from '../../../src/store'
import styled from 'styled-components'
import Button from '../../utils/button'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import CircularProgress from '@material-ui/core/CircularProgress';

interface Tribe {
  name: string,
  description: string,
  img: string,
  uuid: string
}

export default function TribeMsg(props) {
  const { ui, chats, msg } = useStores()
  const [tribe, setTribe] = useState<Tribe>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [alreadyJoined, setAlreadyJoined] = useState<any>()

  async function loadTribe() {
    const p = new URLSearchParams(props.message_content)
    const tribeParams = await getTribeDetails(p.get('host'), p.get('uuid'))
    if (tribeParams) { setTribe(tribeParams) }
    else { setError('Could not load Tribe.') }
    if (tribeParams) {
      const AJ = chats.chats.find(c => c.uuid === tribeParams.uuid)
      if (AJ) setAlreadyJoined(AJ)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTribe()
  }, [])

  if (loading) return <Wrap><CircularProgress /></Wrap>
  if (!(tribe && tribe.uuid)) return <Wrap>Could not load tribe...</Wrap>
  return <Wrap>
    <TribeWrap>
      <TribeImage style={{ backgroundImage: `url(${tribe.img||'/static/tent.png'})` }} />
      <Text>
        <TribeName>
          {tribe.name}
        </TribeName>
        <TribeInfo>
          {tribe.description}
        </TribeInfo>
      </Text>
    </TribeWrap>
    <ButtonWrap>
      <Button onClick={alreadyJoined ?
        async () => {
          console.log("SELECTD THIS CHAT", alreadyJoined)
          msg.seeChat(alreadyJoined.id)
          ui.setSelectedChat(alreadyJoined)
          chats.checkRoute(alreadyJoined.id)
        } :
        () => props.joinTribe(tribe)
      }
        color={alreadyJoined ? 'secondary' : 'primary'}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>
        <Row>
          See Tribe
            <ArrowForwardIcon style={{ marginLeft: 10 }} />
        </Row>
      </Button>
    </ButtonWrap>


  </Wrap>

}

const Row = styled.div`
    display: flex;
    align-items: center;
`

const ButtonWrap = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
`

const Wrap = styled.div`
  padding:16px;
  max-width:440px;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const TribeWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
`

const TribeImage = styled.div`
    margin-right: 15px;
    height: 100px;
    min-width: 100px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
`

const TribeName = styled.div`
    font-size: 20px;
    margin-bottom: 10px;
`
const TribeInfo = styled.div`
    overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; 
`

async function getTribeDetails(host: string, uuid: string) {
  if (!host || !uuid) return
  const theHost = host.includes('localhost') ? 'tribes.sphinx.chat' : host
  try {
    const r = await fetch(`https://${theHost}/tribes/${uuid}`)
    const j = await r.json()
    if (j.bots) {
      try {
        const bots = JSON.parse(j.bots)
        j.bots = bots
      } catch (e) {
        j.bots = []
      }
    }
    return j
  } catch (e) {
    console.log(e)
  }
}