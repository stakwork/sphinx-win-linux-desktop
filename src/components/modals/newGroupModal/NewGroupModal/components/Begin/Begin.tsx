import React from 'react'
import { Button } from 'react-native-paper'

export default function Begin({ setMode }) {
  return <>
    <Button mode="contained" dark={true}
      onPress={() => setMode('group')}
      style={{ backgroundColor: '#55D1A9', borderRadius: 30, width: '75%', height: 60, display: 'flex', justifyContent: 'center' }}>
      Private Group
    </Button>
    <Button mode="contained" dark={true}
      onPress={() => setMode('tribe')}
      style={{ backgroundColor: '#6289FD', borderRadius: 30, width: '75%', height: 60, display: 'flex', justifyContent: 'center', marginTop: 28 }}>
      Sphinx Tribe
    </Button>
  </>
}
