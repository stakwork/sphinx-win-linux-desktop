import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useStores } from '../../../src/store'
import { constants } from '../../../src/constants'

export default function Replay(props) {

    const {msg, user} = useStores()
    const { episode, chat} = props
    const chatID = chat.id
    const [msgsForReplay, setMsgsForReplay] = useState(null)

    function parseMsgs() {
        if (!chatID) return
        const msgs = msg.messages[chatID] || []
        const msgsForEpisode = msgs.filter(m => {
            (m.message_content && m.message_content.includes('::') && m.message_content.includes(episode.id)) ||
            (m.message_content && m.type===constants.message_types.boost)
        })
        const msgsforReplay = []
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
            try {
                const dat = JSON.parse(json)
                if (dat) msgsforReplay.push({
                    ...dat,
                    type: type,
                    alias: m.sender_alias || (m.sender === 1 ? user.alias : ''),
                    date: m.date,
                })
            } catch (e) { }
        })
        setMsgsForReplay(msgsForReplay)
    }

    useEffect(() => {
        parseMsgs()
    }, [])

    console.log("msgsForReplay", msgsForReplay)

    return <ReplayWrap>
        I am here {msgsForReplay}
    </ReplayWrap>
}

const ReplayWrap = styled.div`
    background-color: blue;
    position: absolute;
    top: 275px;
    left: 220px;
`