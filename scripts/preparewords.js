const { createReadStream } = require('fs')
const readline = require('readline')
const { promisify } = require('util')
const writeFile = promisify(require('fs').writeFile)

const levelup = require('levelup')
const leveldown = require('leveldown')

const { sortCharsInStr, isBetween } = require('./utils')

const keyedWordsDB = levelup(leveldown('./keyedwords'))

const wordListByLength = {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
}

function findAnagramSubsets(str, prefix = '') {
    return str.split('')
        .reduce((subsets, char, idx) => {
            const newSubset = prefix + char
            return new Set([...subsets, newSubset, ...findAnagramSubsets(str.slice(idx + 1), newSubset)])
        }, new Set())
}

async function prepareWord(word) {
    if (isBetween(2, word.length, 10)) {
        wordListByLength[word.length].push(word)
        const key = sortCharsInStr(word)
        const keyedWord = await keyedWordsDB.get(key).then(value => JSON.parse(value)).catch(() => ({ words: [], charSets: [...findAnagramSubsets(key)].filter(str => str.length > 2) }))
        keyedWord.words.push(word)
        await keyedWordsDB.put(key, JSON.stringify(keyedWord)).catch((err) => console.log("Putting", keyedWord, "at key", key, "got error: ", err))
    }
}

async function getMatchingWords(key) {
    const keyedWord = await keyedWordsDB.get(key).then(value => JSON.parse(value)).catch(() => ({ words: [], charSets: [] }))
    return keyedWord.words
}

async function matchWords(keyedWord) {
    const key = keyedWord.key.toString()
    const value = JSON.parse(keyedWord.value.toString())

    value.words = await value.charSets.reduce(async (previousPromise, matchingWordKey) => {
        const words = await previousPromise
        const newWords = await getMatchingWords(matchingWordKey)
        return words.concat(newWords)
    }, Promise.resolve([]))

    await keyedWordsDB.put(key, JSON.stringify(value)).catch((err) => console.log("Putting", value, "at key", key, "got error: ", err))
}

async function processWords(wordStream) {
    let processingCount = 0
    console.log("Beginning processing of words")
    for await (const line of wordStream) {
        processingCount++
        if (processingCount % 10000 == 0) {
            console.log("Processing word", processingCount)
        }
        prepareWord(line)
    }

    await writeFile('wordlistbylength.json', JSON.stringify(wordListByLength))

    console.log("Beginning matching of anagram subsets")
    await new Promise((resolve, reject) => {
        keyedWordsDB.createReadStream()
            .on('data', matchWords)
            .on('end', () => resolve('end'))
            .on('error', (err) => {
                console.log('got error', err)
                reject(err)
            })
    })
}

const wordStream = readline.createInterface({
    input: createReadStream(process.argv[2]),
    output: process.stdout,
    terminal: false
})

processWords(wordStream)
    .then(() => console.log("Processing complete!"))