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

/** Returns a basename (a slug for use in making a CSS class) from a filename. */
const getBaseFromFn = fn => {
  // 'ribbon/ability-ribbon.png' -> [ "ribbon/ability-ribbon.png", "ribbon/", "ability-ribbon" ]
  // 'ability-ribbon.png' -> [ "ribbon/ability-ribbon.png", undefined, "ability-ribbon" ]
  const matches = fn.match(/(.*\/)?(.*)\..*$/)
  if (!matches) return null
  return matches[2]
}

module.exports = {
  keyList,
  pokemonDirSet,
  getBaseFromFn
}
