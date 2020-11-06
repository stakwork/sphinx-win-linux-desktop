import TrackPlayer from 'react-native-track-player';

let position = 0

export async function setPosition(){
  const posf = await TrackPlayer.getPosition()
  if(posf||posf==0) position = Math.floor(posf)
}

export function getPosition():number {
  return position
}