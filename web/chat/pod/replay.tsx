import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStores } from '../../../src/store'
import { constants } from '../../../src/constants'
import { useInterval } from './useInterval'
import * as Audio from './audio'
import theme from '../../theme'
import SvgIcon from '@material-ui/core/SvgIcon';

export default function Replay(props) {

    const { msg, user } = useStores()
    const { episode, chat } = props
    const chatID = chat.id
    const [msgsForReplay, setMsgsForReplay] = useState(null)
    const [position, setPosition] = useState(0)

    useInterval(() => {
        tick()
    }, 1000)

    async function tick() {
        const pos = await Audio.getPosition()
        setPosition(pos)
    }

    function parseMsgs() {
        if (!chatID) return
        const msgs = msg.messages[chatID] || []
        const msgsForEpisode = msgs.filter(m => {
            return (m.message_content && m.message_content.includes('::') && m.message_content.includes(episode.id)) ||
                (m.message_content && m.type === constants.message_types.boost && m.message_content.includes(episode.id))
        })
        const msgArray = []
        msgsForEpisode.forEach(m => {
            let json = ""
            let type = ""
            if (m.message_content.includes("::")) {
                const arr = m.message_content.split('::')
                if (arr.length < 2) return
                json = arr[1]
                type = arr[0]
            } else if (m.type === constants.message_types.boost) {
                json = m.message_content
                type = "boost"
            }
            try {
                const dat = JSON.parse(json)
                if (dat) msgArray.push({
                    ...dat,
                    type: type,
                    alias: m.sender_alias || (m.sender === 1 ? user.alias : ''),
                    date: m.date,
                })
            } catch (e) { console.log("error", e) }
        })
        setMsgsForReplay(msgArray)
    }

    useEffect(() => {
        parseMsgs()
    }, [])

    const msgsToShow = msgsForReplay && msgsForReplay.filter(m => {
        return m.ts <= position && m.ts >= position - 5
    })

    return <ReplayWrap>
        {msgsToShow && msgsToShow.map((m, i) => {

            return <div key={i}>
                {m.amount && <BoostWrap bg={theme.highlight}>
                    {(m.type === "boost") && <span style={{display: 'flex', alignItems: 'center'}}>Boost! {m.amount}
                        <Circle style={{ background: theme.lightGreen }}>
                            <RocketIcon style={{ height: 13, width: 13, fill: 'white' }} />
                        </Circle>
                    </span>
                    }
                </BoostWrap>}
                {m.text && <ClipWrap bg={theme.highlight}>
                    {(m.type === "clip") && <span>{m.text}</span>}
                </ClipWrap>}
            </div>
        })}
    </ReplayWrap>
}

function RocketIcon({ style }) {
    return <SvgIcon style={style} viewBox="0 0 24 24">
        <path d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53M6.24 22L9.88 18.36C9.54 18.27 9.21 18.12 8.91 17.91L4.83 22H6.24M2 22H3.41L8.18 17.24L6.76 15.83L2 20.59V22M2 19.17L6.09 15.09C5.88 14.79 5.73 14.47 5.64 14.12L2 17.76V19.17Z" />
    </SvgIcon>
}


const ReplayWrap = styled.div`
    position: absolute;
    height: 300px;
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    justify-content: flex-end;
    flex-wrap: wrap-reverse;
`

const ClipWrap = styled.div`
    background-color: ${p => p.bg};
    margin: 5px;
    padding: 10px;
    border-radius: 6px;
`

const BoostWrap = styled.div`
    background-color: ${p => p.bg};
    margin: 5px;
    padding: 6px;
    border-radius: 6px;
`

const Circle = styled.div`
  height:22px;
  width:22px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-left:10px;
`