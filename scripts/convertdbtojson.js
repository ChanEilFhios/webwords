const levelup = require('levelup')
const leveldown = require('leveldown')
const { isBetween } = require('./utils.js')
const { promisify } = require('util')
const writeFile = promisify(require('fs').writeFile)

const keyedWordsDB = levelup(leveldown('./keyedwords'))

const anagrams = {
    6: {},
    7: {},
    8: {},
    9: {}
}

const saveEntry = entry => {
    const key = entry.key.toString()
    if (isBetween(5, key.length, 10)) {
        anagrams[key.length][entry.key.toString()] = JSON.parse(entry.value.toString())
    }
}

const writeAnagrams = async () => {
    await writeFile('anagrams6.json', JSON.stringify(anagrams[6]))
    await writeFile('anagrams7.json', JSON.stringify(anagrams[7]))
    await writeFile('anagrams8.json', JSON.stringify(anagrams[8]))
    await writeFile('anagrams9.json', JSON.stringify(anagrams[9]))
    console.log("Conversion completed!")
}

keyedWordsDB.createReadStream()
    .on('data', saveEntry)
    .on('close', writeAnagrams)
    .on('end', () => console.log('ended'))
    .on('error', (err) => console.log('got error', err))