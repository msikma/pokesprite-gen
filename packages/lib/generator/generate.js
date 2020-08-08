// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { log } = require('dada-cli-tools/log')
const { runSpritesmith } = require('../spritesmith')
const { generateCSS } = require('./css')

/**
 * Generates a sprite image and a CSS file (or whichever of the two is requested).
 * 
 * This will generate a PNG file buffer and a list of CSS rules in an object that can then
 * be converted into a CSS file.
 * 
 * Prior to generating the sprite, a list of which Pokémon sprites to include will be generated.
 */
const generateSprite = async (assetTypes, { fileInfo }, { optsOutput, optsPokemon }) => {
  const [spriteFileInfo, spriteFileList] = pickFiles(assetTypes, { fileInfo })
  const sprite = await runSpritesmith(spriteFileList)
  const [groupRules, spriteRules, overviewItems] = processRules(sprite.coordinates, spriteFileInfo, optsOutput.clsBasename, optsPokemon.pokemonGen)
  const css = generateCSS(optsOutput, groupRules, spriteRules)
  return {
    css,
    items: overviewItems,
    image: { ...sprite.properties },
    buffer: sprite.image
  }
}

/**
 * Returns a list of file information for each file that we're adding to the spritesheet.
 */
const pickFiles = ({ addPokemon, addInventory, addMisc }, { fileInfo }) => {
  const pickedInfo = {}
  if (addPokemon) Object.assign(pickedInfo, fileInfo.pokemonFiles)
  if (addInventory) Object.assign(pickedInfo, fileInfo.inventoryFiles)
  if (addMisc) Object.assign(pickedInfo, fileInfo.miscFiles)
  return [pickedInfo, Object.keys(pickedInfo)]
}

/** Generates both group and individual sprite rules. */
const processRules = (...args) => {
  return [getGroupRules(...args), ...getSpriteRules(...args)]
}

/** Generates group rules. */
const getGroupRules = (rawCoordinates, fileInfo, baseClass, pokemonGen) => {
  const groupRules = {}
  for (const [path, coords] of Object.entries(rawCoordinates)) {
    const info = fileInfo[path]

    let selector, rules
    if (info.type === 'pokemon') {
      if (groupRules[info.type]) continue
      selector = `.${baseClass}.${info.type}`
      rules = { 'width': `${coords.width}px`, 'height': `${coords.height}px`, 'background': `url('pokesprite-pokemon-gen${pokemonGen}.png')` }
      groupRules[info.type] = { selector, rules, resolution: '1x' }
    }
    if (info.type === 'inventory') {
      if (groupRules[info.group]) continue
      selector = `.${baseClass}.${info.group}`
      rules = { 'width': `${coords.width}px`, 'height': `${coords.height}px`, 'background': `url('pokesprite-inventory.png')` }
      groupRules[info.group] = { selector, rules, resolution: '1x' }
    }
    if (info.type === 'misc') {
      if (groupRules[info.group]) continue
      selector = `.${baseClass}.${info.group}`
      rules = { 'background': `url('pokesprite-misc.png')` }
      groupRules[info.group] = { selector, rules, resolution: '1x' }
    }
  }
  return Object.values(groupRules)
}

/** Generates individual sprite rules. */
const getSpriteRules = (rawCoordinates, fileInfo, baseClass) => {
  const spriteRules = []
  const overviewLines = []
  for (const [path, coords] of Object.entries(rawCoordinates)) {
    const info = fileInfo[path]
    
    let selectorBase, selector, rules
    if (info.type === 'pokemon') {
      // Iterate over form aliases. '$' is the default, others are aliases of the current file.
      for (const formName of info.formAliases) {
        selectorBase = getPokemonSelector(info.name, info.basename, formName, info.genderName, info.group === 'shiny')
        selector = `.${baseClass}.${selectorBase}`
        rules = { 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
        spriteRules.push({ selector, rules })
        overviewLines.push({
          selector: `.${baseClass}.pokemon.${selectorBase}`,
          info: {
            ...info,
            // Save the new form name, if this is an alias.
            formName: formName === '$' ? info.formName : formName,
            // Save what form this is an alias of.
            isAliasOf: formName === info.formName ? null : info.formName
          }
        })
      }
    }
    if (info.type === 'inventory') {
      selector = `.${baseClass}.${info.group}.${info.name}`
      rules = { 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
      spriteRules.push({ selector, rules })
      overviewLines.push({ selector, info })
    }
    if (info.type === 'misc') {
      selector = `.${baseClass}.${info.group}.${info.name}`
      rules = { 'width': `${coords.width}px`, height: `${coords.height}px`, 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
      spriteRules.push({ selector, rules })
      overviewLines.push({ selector, info })
    }
  }
  return [spriteRules, overviewLines]
}

const getPokemonSelector = (name, basename, formName, genderName, isShiny) => {
  let segments = []
  if (isShiny) segments.push('shiny')
  if (genderName === 'f') segments.push('female')
  const baseSelector = formName === '$' ? name : `${basename}-${formName}`
  return `${baseSelector}${segments.length ? `.${segments.join('.')}` : ''}`
}

module.exports = {
  generateSprite
}
