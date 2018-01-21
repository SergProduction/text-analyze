const fs = require('fs')
const pathM = require('path')

const path = str => pathM.join(__dirname, str)

const log = (...p) => console.log(...p)

const logOne = x => (log(x),x)

const entries = obj => {
  const keys = Object.keys(obj)
  return keys.map((k, i) => [k, obj[k]])
}

const len = obj => Object.keys(obj).length

const promChain = fn =>
  aPromise =>
    aPromise.then(fn)

const promToFunc = prom => fn => prom.then(fn)

const compose = (...fn) =>
  fn.reduceRight((prev, next) => {
    return x => prev(next(x))
  }, x => x)

const composeAsync = (...fn) =>
  promChain(compose(...fn))

const cmpAsync = composeAsync

const readFile = name => new Promise((res, rej) => {
  fs.readFile(path(name), (err, file) => {
    if (err) {
      log('fserr',err)
      rej(err)
      return
    }
    res(file.toString())
  })
})

const splitText = str => {
  const words = {}
  let st = str.split(' ')
  st = st.map(w => w.replace(/,|\./, ''))
  st = st.map(w => w.trim())
  st = st.filter(w => w !== '')
  return st
}

const arrToMap = arr => {
  const comm = {}
  arr.forEach(it => {
    comm[it]
      ? (comm[it]++, true)
      : (comm[it]=1, false)
  })
  return comm
}

const maxProp = obj => prop => entries(obj)
  .reduce((max, [w, cnt]) => {
    return max.c < cnt ? {w:w, c:cnt} : max
  }, {w:'net', c:0})


const filter = fn => arr => arr.filter(fn)

const map = fn => arr => arr.map(fn)

const siblingWords = oMap => arr => {
  const sibl = mid => {
    let i = Math.max(mid-3, 0)
    let max = mid+3
    let acc = []
    for(; i<max; i++) {
      acc.push(arr[i])
    }
    return acc
  }
  const accum = {}
  for(let i=0; i<1000; i++) {
    const it = arr[i]
    if (oMap[it]) {
      const ww = sibl(i)
      accum[it]
	? accum[it].push(ww)
	: (accum[it]=[ww])
    }
  }
  return accum
}

const text = composeAsync(x => x)(readFile('./book.txt'))

const wordsArr = composeAsync(
  splitText,
  arrToMap,
  entries,
  filter(i => i[1] > 5)
)(text)

const wordsMap = cmpAsync(
  map(i => i[0]),
  arrToMap
)(wordsArr)

wordsMap.then(m => {
  return text.then(t => {
    const words = splitText(t)
    const r = siblingWords(m)(words)
    log(r)
    return r
  })
})
