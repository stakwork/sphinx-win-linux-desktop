import React, {useState} from 'react'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ReplyIcon from '@material-ui/icons/Reply';
import LinkIcon from '@material-ui/icons/Link';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Button from '@material-ui/core/Button';
import { useHasLink } from './msg/hooks'
import { useStores, hooks } from '../../src/store'
import theme from '../theme'


export default function msgMenu({anchorEl, menuMessage, isMe, handleMenuClose, onCopy}) {
    const [deleting, setDeleting] = useState(false)
    const { ui, msg} = useStores()

    const link = useHasLink(menuMessage)

    async function deleteMessage() {
      if (deleting) return
      setDeleting(true)
      await msg.deleteMessage(menuMessage.id)
      setDeleting(false)
      handleMenuClose()
    }

    return <Menu
        id="simple-menu" anchorEl={anchorEl} getContentAnchorEl={null} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: isMe(menuMessage) ? 'left' : 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: isMe(menuMessage) ? 'right' : 'left',
        }}
        PaperProps={{
            style: {
                backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep
            },
        }}>
        <MenuItem onClick={() => { navigator.clipboard.writeText(menuMessage.message_content), handleMenuClose(), onCopy('Text') }}
            style={{ fontSize: 14, color: 'white', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" style={{ fill: 'white', marginRight: 8 }}>
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>Copy Text
                  </MenuItem>
        {link &&
            <MenuItem onClick={() => { navigator.clipboard.writeText(link), handleMenuClose(), onCopy('Link') }}
                style={{ fontSize: 14, color: 'white', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
                <LinkIcon style={{ fontSize: 'medium', marginRight: 8 }} />Copy Link
                  </MenuItem>}
        <MenuItem onClick={() => { ui.setReplyUUID(menuMessage.uuid), handleMenuClose() }}
            style={{ fontSize: 14, color: 'white', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
            <ReplyIcon style={{ fontSize: 'medium', marginRight: 8 }} />Reply
                  </MenuItem>

        {isMe(menuMessage) &&
            <MenuItem onClick={deleteMessage}
                style={{ fontSize: 14, color: '#fe5251', backgroundColor: isMe(menuMessage) ? theme.highlight : theme.extraDeep }}>
                <DeleteForeverIcon style={{ color: 'red', fontSize: 'medium', marginRight: 8 }} />
                {deleting ? 'Deleting...' : 'Delete Message'}
            </MenuItem>}
    </Menu>
}