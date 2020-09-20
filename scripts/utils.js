const sortCharsInStr = str => str.split('').sort().join('')

const randomFromLength = length => Math.floor(Math.random()*length)

const isBetween = (low, value, high) => (low < value) && (value < high)

module.exports = {
    sortCharsInStr,
    randomFromLength,
    isBetween
}