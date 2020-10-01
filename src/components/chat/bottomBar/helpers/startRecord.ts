export default async function startRecord(audioRecorderPlayer, setRecordSecs, setRecordingStartTime) {
  setRecordSecs('0:00')
  try{
    await audioRecorderPlayer.startRecorder()
    audioRecorderPlayer.addRecordBackListener((e) => {
      const str = audioRecorderPlayer.mmssss(
        Math.floor(e.current_position),
      )
      const idx = str.lastIndexOf(':')
      setRecordSecs(str.substr(1,idx-1))
    })
    setRecordingStartTime(Date.now().valueOf())
  } catch(e){console.log('startRecord: ', e)}
}