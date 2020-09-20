function findAnagramSubsets(str, prefix = '') {
    return str.split('')
    .reduce((subsets, char, idx) => {
        const newSubset = prefix + char
        console.log("newSubset:", newSubset, ', newStr: ', str.slice(idx + 1) )
        return new Set([...subsets, newSubset, ...findAnagramSubsets(str.slice(idx + 1), newSubset)])
    },new Set())
}

console.log(...findAnagramSubsets('aaa'))