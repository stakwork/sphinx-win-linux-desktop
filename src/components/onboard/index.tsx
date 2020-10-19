import React, {useState} from 'react'
import {View,StyleSheet,Animated} from 'react-native'
import Code from './code'
import Welcome from './welcome'
import NameAndKey from './nameAndKey'
import Ready from './ready'
import PIN from './choosePIN'
import ProfilePic from './profilePic'

/*
1. scan or enter code, create ip (from invite server), create auth_token in Relay
2. create inviter contact (relay)
3. set pin
4. set my nickname (and RSA pubkey!)
5. set my profile pic
6. Ready!
*/

// Final: ProfilePic before Ready
const steps=[Code,Welcome,PIN,NameAndKey,ProfilePic,Ready]
export default function Invite({onFinish}) {  
  const [step, setStep] = useState(1)

  function stepForward(){
    if(step>=steps.length){
      onFinish()
    }
    setStep(step+1)
  }
  function stepBack(){
    setStep(step-1)
  }
  
  return <View style={styles.wrap} accessibilityLabel="onboard-wrap">
    {steps.map((C,i)=> {
      const render = i===step-2 || i===step-1 || i===step
      if(!render) return <View key={i} />
      return <C key={i} z={i} 
        show={step>i} 
        onDone={stepForward} onBack={stepBack} 
        onRestore={onFinish}
      />
    })}
  </View>
}

const styles = StyleSheet.create({
  wrap:{flex:1}
})
