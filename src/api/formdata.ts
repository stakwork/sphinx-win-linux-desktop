
export function createFormData(photo, body) {
  const data = new FormData()

  const dat = JSON.parse(JSON.stringify({
    name: photo.fileName || 'photo',
    type: 'image/jpeg',//photo.type,
    uri: photo.uri // if ios need to remove file://
  }))

  data.append("file", dat)

  Object.keys(body).forEach(key => {
    data.append(key, body[key])
  })

  return data
}
