async function findByClassName (app, className, tag) {
    const elements = await app.client.$$(tag || "div")

    console.log("elements", elements)
    let l;

    await asyncForEach(elements, async e => {
        const elementClass = await e.getAttribute("class")

        console.log("elementClass", elementClass)

        if(elementClass === className){
            l = e
            console.log("l", l)
        }
    })
    return l
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  module.exports = { findByClassName }