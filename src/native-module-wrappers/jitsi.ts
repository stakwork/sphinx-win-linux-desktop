import { NativeModules, requireNativeComponent } from 'react-native'

export const JitsiMeetView = requireNativeComponent('RNJitsiMeetView')
export const JitsiMeetModule = NativeModules.RNJitsiMeetModule

const call = JitsiMeetModule.call;
const audioCall = JitsiMeetModule.audioCall;
JitsiMeetModule.call = (url:string, userInfo:{[k:string]:any}) => {
  userInfo = userInfo || {};
  call(url, userInfo);
}
JitsiMeetModule.audioCall = (url:string, userInfo:{[k:string]:any}) => {
  userInfo = userInfo || {};
  audioCall(url, userInfo);
}

export default JitsiMeetModule
