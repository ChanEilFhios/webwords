const levelup = require('levelup')
const leveldown = require('leveldown')

const keyedWordsDB = levelup(leveldown('./keyedwords'))

keyedWordsDB.get(process.argv[2])
.then(keyedWord => {
    console.log(keyedWord.toString())
})
.catch(err => console.log("Got error: ", err))