import {useState} from 'react'
import {useStores} from '../../../src/store'

export function useCachedEncryptedFile(props, ldat){
  const {meme} = useStores()
  const {id, media_key, media_type, media_token} = props

  const [data, setData] = useState('')
  const [uri, setURI] = useState('')
  const [loading, setLoading] = useState(false)
  const [paidMessageText, setPaidMessageText] = useState(null)
  const isPaidMessage = media_type==='text/plain'
}