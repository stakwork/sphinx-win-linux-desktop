
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

const ARP = new AudioRecorderPlayer()

let currentlyPlayingSource = ''

export default {
  play: async function(source:string, jumpTo:any, callback:Function){
    if(source!==currentlyPlayingSource) {
      await ARP.removePlayBackListener();
      await ARP.resumePlayer().catch(()=>{})
      await ARP.stopPlayer().catch(()=>{})
      currentlyPlayingSource = source
    }
    if(jumpTo) {
      await ARP.startPlayer(source).catch(()=>{})
      await ARP.seekToPlayer(parseInt(jumpTo)).catch(()=>{})
    } else {
      await ARP.startPlayer(source).catch(()=>{})
    }
    ARP.addPlayBackListener(callback)
  },
  seekTo: function(s:number){
    ARP.seekToPlayer(s).catch(()=>{})
  },
  stop: function(){
    ARP.stopPlayer().catch(()=>{})
    ARP.removePlayBackListener()
  }
}