import React, { useState } from 'react'
import { IconButton, TextInput, Portal } from 'react-native-paper'
import { View } from 'react-native'
import { inputStyles } from './shared'
import QR from '../../utils/qr'
import PubKey from '../../modals/pubkey'
import { useTheme } from '../../../store'

export default function QrInput({ name, label, required, handleChange, handleBlur, setValue, value, displayOnly, accessibilityLabel, transform, extraCopySuffix }) {
  const theme = useTheme()

  const [scanning, setScanning] = useState(false)
  function scan(data) {
    if (data.includes(':') && transform) {
      transform({ [name]: data })
    } else {
      setValue(data)
    }
    setScanning(false)
  }

  let lab = `${label.en}${required ? ' *' : ''}`
  if (displayOnly) lab = label.en
  return <View style={{ ...inputStyles, ...styles.wrap }}>
    <TextInput
      accessibilityLabel={accessibilityLabel}
      disabled={displayOnly}
      label={lab}
      onChangeText={t => {
        if (t.includes(':') && transform) {
          transform({ [name]: t })
        } else {
          setValue(t)
        }
      }}
      onBlur={handleBlur(name)}
      value={value}
      style={{ backgroundColor: theme.bg, paddingRight: 32 }}
      placeholderTextColor={theme.subtitle}
    />
    <IconButton
      icon="qrcode-scan"
      color="#888"
      size={25}
      style={{ position: 'absolute', right: 0, top: 10 }}
      onPress={() => setScanning(true)}
    />

    {scanning && !displayOnly && <Portal>
      <QR onCancel={() => setScanning(false)}
        onScan={data => scan(data)}
        showPaster={false}
      />
    </Portal>}

    {scanning && displayOnly && <Portal>
      <PubKey pubkey={value} visible={true}
        onClose={() => setScanning(false)}
        extraCopySuffix={extraCopySuffix}
      />
    </Portal>}
  </View>
}

const styles = {
  wrap: {
    flex: 1,
  },
}