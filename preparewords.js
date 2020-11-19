const { readFileSync, writeFileSync } = require('fs')
const path = require("path")
const { sortCharsInStr } = require('./scripts/utils')

const srcFile = path.join(__dirname, process.argv[2] || "wordlist.txt")

function findAnagramSubsets(str, prefix = '') {
    return str.split('')
        .reduce((subsets, char, idx) => {
            const newSubset = prefix + char
            return new Set([...subsets, newSubset, ...findAnagramSubsets(str.slice(idx + 1), newSubset)])
        }, new Set())
}

const addWord = (wordDB, aWord) => {
    const [word, level] = aWord.split(',')

    const key = sortCharsInStr(word)
    const wordEntry = wordDB.words[key] || {words: [], subwords: []}

    wordEntry.words.push({word, level})

    wordDB.words[key] = wordEntry
    if (word.length === 9) {
        wordDB.nines.push(word)
    }

    return wordDB
}

writeFileSync("worddb.json", JSON.stringify(readFileSync(srcFile)
.toString()
.split('\n')
.reduce(addWord, {words: {}, nines: []}), null, 2))