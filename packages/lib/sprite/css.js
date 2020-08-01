// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

/**
 * Runs through groups and individual sprites and generates CSS for them.
 * 
 * Each sprite belongs to a group, and the group contains any base rules that apply
 * to all items (such as the 'background-image' for the sprite).
 */
const generateCSS = (groupRules, spriteRules) => {
  const buffer = []
  for (const group of groupRules) {
    const { selector, rules, resolution } = group
    buffer.push(`${selector} { ${unpackRules(addResolutionRule(resolution, rules)).join('; ')} }`)
  }
  for (const sprite of spriteRules) {
    const { selector, rules } = sprite
    buffer.push(`${selector} { ${unpackRules(rules).join('; ')} }`)
  }
  return buffer.join('\n')
}

/** Merges 'background-position-x' and 'background-position-y' into one value. */
const mergeBackgroundPosition = (rules) => {
  const hasBgPos = rules['background-position-x'] || rules['background-position-y']
  if (!hasBgPos) return rules

  const bgPosX = rules['background-position-x'] || '0'
  const bgPosY = rules['background-position-y'] || '0'
  delete rules['background-position-x']
  delete rules['background-position-y']
  rules['background-position'] = `${bgPosX} ${bgPosY}`
  return rules
}

/** Adds a rule concerning image display. */
const addResolutionRule = (resolution, rules) => {
  // Ensure pixel art doesn't look blurry on retina screens.
  if (resolution === '1x') {
    rules['image-rendering'] = 'pixelated'
  }
  return rules
}

/** Converts an object of key/value pairs to CSS rules. */
const unpackRules = rules => Object.entries(mergeBackgroundPosition(rules)).map(r => `${r[0]}: ${r[1]}`)

module.exports = {
  generateCSS
}
