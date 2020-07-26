// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

/**
 * Takes an array of a boolean and a string, and returns a list of the strings for each boolean that is true.
 */
const keyList = (...keyVal) => {
  const list = []
  for (const kv of keyVal) {
    if (kv[0]) list.push(kv[1])
  }
  return list
}

/** Returns the Pokémon data set name for a directory. E.g. 'gen-7' for 'pokemon-gen7x'. */
const pokemonDirSet = dir => {
  const setMatches = dir.match(/pokemon-((gen)([0-9])x?)/)
  return setMatches ? setMatches.slice(-2).join('-') : null
}

module.exports = {
  keyList,
  pokemonDirSet
}
