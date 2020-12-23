import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStores } from '../../../src/store'
import { constants } from '../../../src/constants'
import {useInterval} from './useInterval'
import * as Audio from './audio'

export default function Replay(props) {

    const {msg, user} = useStores()
    const { episode, chat} = props
    const chatID = chat.id
    const [msgsForReplay, setMsgsForReplay] = useState(null)
    const [position, setPosition] = useState(0)

    useInterval(()=>{
        tick()
      }, 1000)

    async function tick(){
        const pos = await Audio.getPosition()
        setPosition(pos)
    }

    function parseMsgs() {
        if (!chatID) return
        const msgs = msg.messages[chatID] || []
        const msgsForEpisode = msgs.filter(m => {
            return (m.message_content && m.message_content.includes('::') && m.message_content.includes(episode.id)) ||
                (m.message_content && m.type===constants.message_types.boost && m.message_content.includes(episode.id))
        })
        const msgArray = []
        msgsForEpisode.forEach(m => {
            let json = ""
            let type = ""
            if(m.message_content.includes("::")){
                const arr = m.message_content.split('::')
                if (arr.length < 2) return
                json = arr[1]
                type = arr[0]
            } else if (m.type===constants.message_types.boost) {
                json = m.message_content
                type = "boost"
            }
            console.log("json", json, typeof json)
            try {
                const dat = JSON.parse(json)
                console.log("dat", dat)
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

    console.log("msgsForReplay", msgsForReplay)
    const msgsToShow = msgsForReplay && msgsForReplay.filter(m => {
        return m.ts <= position && m.ts >= position-5
    })

    console.log("msgsToShow", msgsToShow)

    return <ReplayWrap>
        {/* {msgsToShow && msgsToShow.map(m=>{
            return <span>{m.text}</span>
        })}  */}
    </ReplayWrap>
}

const ReplayWrap = styled.div`
    position: absolute;
    top: 275px;
    left: 220px;
`