// import fs from 'node:fs'
const fs = require('fs')

const data = fs.readFileSync('wasm.txt').toString('utf-8')

function decodeFromBase64(input) {
  input = input.replace(/\s/g, '')
  return atob(input)
}

const byteCharacters = decodeFromBase64(data)

const byteNumbers = new Array(byteCharacters.length)
for (let i = 0; i < byteCharacters.length; i++)
  byteNumbers[i] = byteCharacters.charCodeAt(i)

const byteArray = new Uint8Array(byteNumbers)
const blob = new Blob([byteArray], { type: 'application/wasm' })

async function init() {
  const buffer = Buffer.from(await blob.arrayBuffer())

  fs.writeFile('shine.wasm', buffer, () => console.log('wasm saved!'))
}

init()
