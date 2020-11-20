const { writeFileSync } = require('fs')

const wordDB = require('./worddb.json')
const { sortCharsInStr } = require('./scripts/utils')

function findAnagramSubsets(str, prefix = '') {
    return str.split('')
        .reduce((subsets, char, idx) => {
            const newSubset = prefix + char
            return new Set([...subsets, newSubset, ...findAnagramSubsets(str.slice(idx + 1), newSubset)])
        }, new Set())
}

const addSubstrings = (wordDB, word) => {
    const key = sortCharsInStr(word)
    const wordEntry = wordDB.words[key]

    wordEntry.subwords = [...findAnagramSubsets(key)].filter((word) => (word.length > 2 && wordDB.words[word]))

    wordDB.words[key] = wordEntry

    return wordDB
}

writeFileSync("anagramdb.json",JSON.stringify(wordDB.nines.reduce(addSubstrings, wordDB), null, 2))