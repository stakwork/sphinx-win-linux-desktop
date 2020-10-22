import React, {useState} from 'react'
import {View,StyleSheet,Animated} from 'react-native'
import Code from './code'
import Welcome from './welcome'
import NameAndKey from './nameAndKey'
import Ready from './ready'
import PIN from './choosePIN'
import ProfilePic from './profilePic'
import {useStores} from '../../store'
import {useObserver} from 'mobx-react-lite'

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
  const {user} = useStores()

  return useObserver(()=>{
    let step = user.onboardStep

    function stepForward(){
      if(step>=steps.length-1){
        onFinish()
      } else {
        user.setOnboardStep(step+1)
      }
    }
    function stepBack(){
      user.setOnboardStep(step-1)
    }
    
    return <View style={styles.wrap} accessibilityLabel="onboard-wrap">
      {steps.map((C,i)=> {
        const render = i===step-1 || i===step || i===step+1
        if(!render) return <View key={i} />
        return <C key={i} z={i} 
          show={step>i-1} 
          onDone={stepForward} onBack={stepBack} 
          onRestore={onFinish}
        />
      })}
    </View>
  })
}

const styles = StyleSheet.create({
  wrap:{flex:1}
})
