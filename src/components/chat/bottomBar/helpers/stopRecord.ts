export default async function stopRecord(cb,sleep,audioRecorderPlayer,setRecordSecs,time?) {
  const now = Date.now().valueOf()
  let tooShort = false
  if(now-time<1000){
    tooShort = true
    await sleep(1000)
  }
  try{
    const result = await audioRecorderPlayer.stopRecorder()
    audioRecorderPlayer.removeRecordBackListener()
    setRecordSecs('0:00')
    if(cb && !tooShort) cb(result)
  } catch(e){console.log(e)}
}