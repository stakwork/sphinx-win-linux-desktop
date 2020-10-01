export default async function tookPic(img, setDialogOpen, setTakingPhoto, setUploading, upload) {
  setDialogOpen(false)
  setTakingPhoto(false)
  setUploading(true)
  try {
    await upload(img.uri)
  } catch(e){
    console.log(e)
    setUploading(false)
  }
}