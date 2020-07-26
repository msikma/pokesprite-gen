// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { log } = require('dada-cli-tools/log')
const { runSpritesmith } = require('./spritesmith')
const { generateCSS } = require('./css')

/**
 * Generates a sprite image and a CSS file (or whichever of the two is requested).
 * 
 * This will generate a PNG file buffer and a list of CSS rules in an object that can then
 * be converted into a CSS file.
 * 
 * Prior to generating the sprite, a list of which Pokémon sprites to include will be generated.
 */
const generateSprite = async (assetTypes, { fileInfo }, { optsOutput }) => {
  const [spriteFileInfo, spriteFileList] = pickFiles(assetTypes, { fileInfo })
  const sprite = await runSpritesmith(spriteFileList)
  const [groupRules, spriteRules] = processRules(sprite.coordinates, spriteFileInfo, optsOutput.clsBasename)
  const css = generateCSS(groupRules, spriteRules)
  return {
    css,
    image: { ...sprite.properties },
    buffer: sprite.image
  }
}

/**
 * Returns a list of file information for each file that we're adding to the sprite sheet.
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
  return [getGroupRules(...args), getSpriteRules(...args)]
}

/** Generates group rules. */
const getGroupRules = (rawCoordinates, fileInfo, baseClass) => {
  const groupRules = {}
  for (const [path, coords] of Object.entries(rawCoordinates)) {
    const info = fileInfo[path]

    let selector, rules
    if (info.type === 'pokemon') {
      if (groupRules[info.type]) continue
      selector = `.${baseClass}.${info.type}`
      rules = { 'width': `${coords.width}px`, 'height': `${coords.height}px` }
      groupRules[info.type] = { selector, rules, resolution: '1x' }
    }
    if (info.type === 'inventory') {
      if (groupRules[info.group]) continue
      selector = `.${baseClass}.${info.group}`
      rules = { 'width': `${coords.width}px`, 'height': `${coords.height}px` }
      groupRules[info.group] = { selector, rules, resolution: '1x' }
    }
  }
  return Object.values(groupRules)
}

/** Generates individual sprite rules. */
const getSpriteRules = (rawCoordinates, fileInfo, baseClass) => {
  const spriteRules = []
  for (const [path, coords] of Object.entries(rawCoordinates)) {
    const info = fileInfo[path]
    
    let selector, rules
    if (info.type === 'pokemon') {
      selector = `.${baseClass}.${info.name}`
      rules = { 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
      spriteRules.push({ selector, rules })
    }
    if (info.type === 'inventory') {
      selector = `.${baseClass}.${info.group}.${info.name}`
      rules = { 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
      spriteRules.push({ selector, rules })
    }
    if (info.type === 'misc') {
      selector = `.${baseClass}.${info.group}.${info.name}`
      rules = { 'width': `${coords.width}`, height: `${coords.height}`, 'background-position-x': `-${coords.x}px`, 'background-position-y': `-${coords.y}px` }
      spriteRules.push({ selector, rules })
    }
  }
  return spriteRules
}

module.exports = {
  generateSprite
}
