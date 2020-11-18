const { promisify } = require("util")
const readdir = promisify(require('fs').readdir)
const { readFileSync, writeFileSync } = require('fs')
const path = require("path")

const srcDir = path.join(__dirname, process.argv[2] || "scowl-lists")
const sizeRegEx = /max_size:\W+(\d+)/i
const wordRegEx = /^[a-z]{3,9}$/
const wordLevels = {
    "10": "a",
    "20": "a",
    "35": "b",
    "40": "c",
    "50": "c",
    "55": "d",
    "60": "d"
}

const outputValue = label => value => console.log(label, value)

const extractSize = metaData => sizeRegEx.exec(metaData)[1]
const isValidWord = word => wordRegEx.test(word)

const addWords = level => (wordList, word) => {
    wordList[word] = Math.min(wordList[word] || 100, level)

    return wordList
}

const addWordsFromFile = (wordList, fileName) => {
    const [meta, words] = readFileSync(fileName)
    .toString()
    .split('---')

    return words
    .split('\n')
    .filter(isValidWord)
    .reduce(addWords(extractSize(meta)), wordList)
}

const fixPaths = fileName => path.join(srcDir, fileName)

const collectWords = files => files
                            .map(fixPaths)
                            .reduce(addWordsFromFile, {})

readdir(srcDir)
.then(collectWords)
.then(words => {
    const wordList = []
    for (const [key, value] of Object.entries(words)) {
        wordList.push(`${key},${value}`)
    }
    return wordList.join('\n')
})
.then(words => writeFileSync("wordlist.txt", words))
