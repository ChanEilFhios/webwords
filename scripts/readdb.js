const levelup = require('levelup')
const leveldown = require('leveldown')

const keyedWordsDB = levelup(leveldown('./keyedwords'))

const showEntry = entry => console.log(entry.key.toString(), '=', entry.value.toString())

keyedWordsDB.createReadStream()
.on('data', showEntry)
.on('close', () => console.log('closed'))
.on('end', () => console.log('ended'))
.on('error', (err) => console.log('got error', err))