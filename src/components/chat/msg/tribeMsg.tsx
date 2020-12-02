import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme, useStores } from '../../../store'
import {ActivityIndicator,Button} from 'react-native-paper'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'

interface Tribe {
  name: string,
  description: string,
  img: string,
  uuid: string
  host?: string
}

export default function TribeMessage(props) {
  const theme = useTheme()
  const { ui, chats } = useStores()
  const [tribe, setTribe] = useState<Tribe>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showJoinButton, setShowJoinButton] = useState<boolean>(false)

  const navigation = useNavigation()

  async function loadTribe() {
    const p = extractURLSearchParams(props.message_content)
    const tribeParams = await getTribeDetails(p['host'], p['uuid'])
    if (tribeParams) { setTribe(tribeParams) }
    else { setError('Could not load Tribe.') }
    if (tribeParams) {
      const AJ = chats.chats.find(c => c.uuid === tribeParams.uuid)
      if (!AJ) setShowJoinButton(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTribe()
  }, [])

  function seeTribe(){
    ui.setJoinTribeParams(tribe)
    navigation.navigate('Home', { params: { rnd: Math.random() } })
  }

  if (loading) return <View style={styles.wrap}>
    <ActivityIndicator animating={true} color={theme.subtitle} />
  </View>
  if (!(tribe && tribe.uuid)) return <View style={styles.wrap}>Could not load tribe...</View>

  return <View style={{ ...styles.wrap }}>
    <View style={styles.tribeWrap}>
      {tribe.img && <FastImage source={{uri:tribe.img}} resizeMode={FastImage.resizeMode.cover} 
        style={{width:70,height:70,flexShrink:0,minWidth:75}}
      />}
      <View style={styles.tribeText}>
        <Text style={{...styles.tribeName,color:theme.title}}
          numberOfLines={1}>
          {tribe.name}
        </Text>
        <Text style={{...styles.tribeDescription,color:theme.subtitle}}
          numberOfLines={2}>
          {tribe.description}
        </Text>
      </View>
    </View>
    {showJoinButton && <Button mode="contained" icon="arrow-right" onPress={seeTribe} accessibilityLabel="see-tribe-button"
      style={{ width: '100%', marginTop:12 }}>
      See Tribe 
    </Button>}
  </View>
}

const styles = StyleSheet.create({
  wrap:{
    padding:16,
    maxWidth:440,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  tribeWrap:{
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tribeText:{
    display: 'flex',
    flexDirection: 'column',
    marginLeft:8,
    maxWidth:160
  },
  tribeName:{
    fontSize: 16,
    marginBottom: 5,
  },
  tribeDescription:{
    fontSize: 14,
  }
})


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

function extractURLSearchParams(url:string) {
  let regex = /[?&]([^=#]+)=([^&#]*)/g
  let match
  let params = {}
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params
}