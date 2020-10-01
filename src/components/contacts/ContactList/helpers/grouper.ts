export default function grouper(data: any){
  // takes "alias"
  const ret = []
  const groups = data.reduce((r, e) => {
    let title = e.alias[0]
    if(!r[title]) r[title] = {title, data:[e]}
    else r[title].data.push(e)
    return r
  }, {})
  Object.values(groups).forEach(g=>{
    ret.push(g)
  })
  return ret
}