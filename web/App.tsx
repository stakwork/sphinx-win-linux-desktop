import React, {useState,useEffect} from 'react'
import {useStores} from '../src/store'
import './style.css'
import theme from './theme'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useObserver} from 'mobx-react-lite'
import styled from 'styled-components'
import PIN, {wasEnteredRecently} from './modals/pin'
import Onboard from './onboard'
import Main from './main'
import {instantiateRelay} from '../src/api'

function Wrap(){
  const {ui} = useStores()
  return useObserver(()=>{
    if(ui.ready) return <App />
    return <Loading>
      <CircularProgress style={{color:'white'}} />
    </Loading>
  })
}

function App(){
  const {user} = useStores()
  const [pinned,setPinned] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  useEffect(()=>{
    (async () => {
      const isSignedUp = (user.currentIP && user.authToken)?true:false
      setSignedUp(isSignedUp)
      if(isSignedUp){
        instantiateRelay(user.currentIP, user.authToken)
      }
      const pinWasEnteredRecently = await wasEnteredRecently()
      if(pinWasEnteredRecently) setPinned(true)
    })()
  },[])
  if(!signedUp) {
    return <Onboard onRestore={()=>{
      setSignedUp(true)
      setPinned(true)
    }}/>
  }
  if(!pinned) {
    return <main className="main" style={{background:theme.bg}}>
      {!pinned && <PIN onFinish={()=>setPinned(true)} />}
    </main>
  }
  return <Main />
}

const Loading=styled.div`
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(145deg, #A68CFF 0%, #6A8FFF) 0% 0% / cover; 
`

export default Wrap
