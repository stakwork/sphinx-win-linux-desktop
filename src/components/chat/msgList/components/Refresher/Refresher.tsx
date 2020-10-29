import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import EE, {SHOW_REFRESHER} from '../../../../utils/ee';
import styles from './styles'

function Refresher() {
  const [show,setShow] = useState(false)
  useEffect(()=>{
    function doShow(){
      setShow(true)
      setTimeout(()=>{
        setShow(false)
      }, 1000)
    }
    EE.on(SHOW_REFRESHER, doShow)
    return ()=> EE.removeListener(SHOW_REFRESHER,doShow)
  },[])
  if(!show) return <></>
  return <View style={{...styles.refreshingWrap,height:show?60:0}}>
    <View style={styles.refreshingCircle}>
      <ActivityIndicator animating={true} color="grey" size={25} />
    </View>
  </View>
}

export default Refresher;