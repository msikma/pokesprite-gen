// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { pick } = require('lodash')
const { log } = require('dada-cli-tools/log')
const { getSpriteFiles } = require('./sprite/assets')
const { generateSprite } = require('./sprite/generate')
const { generateHTML } = require('./sprite/html')
const { saveAssets, saveStandardBuildAssets } = require('./sprite/save')

/** List of special build functions. */
const builds = {
  /** Default script - uses all the user's cli args. */
  default: async ({ assetTypes, optsPokemon, optsInventory, optsMisc, optsOutput }) => {
    const assetData = await getSpriteFiles(assetTypes, { optsPokemon, optsInventory, optsMisc })
    const spriteData = await generateSprite(assetTypes, assetData, { optsOutput })
    return saveAssets(spriteData, { optsOutput })
  },
  /** Standard build - creates separate files for Pokémon, inventory items and misc sprites. Published to npm. */
  buildStandard: async ({ optsPokemon, optsInventory, optsMisc, optsOutput }) => {
    const assetData = await getSpriteFiles({ addPokemon: true, addInventory: true, addMisc: true }, { optsPokemon: { ...optsPokemon, pokemonGen: '8' }, optsInventory, optsMisc })
    const pokemon = await generateSprite({ addPokemon: true }, assetData, { optsOutput })
    const inventory = await generateSprite({ addInventory: true }, assetData, { optsOutput })
    const misc = await generateSprite({ addMisc: true }, assetData, { optsOutput })
    const overview = await generateHTML({ addPokemon: true, addInventory: true, addMisc: true }, { pokemon, inventory, misc })
    return saveStandardBuildAssets({ pokemon, inventory, misc }, { optsOutput })
  }
}

/** Returns a function for a special build if requested. */
const getBuildScript = args => {
  const buildList = Object.keys(builds)
  const reqSet = pick(args, buildList)
  for (const [buildName, isRequested] of Object.entries(reqSet)) {
    if (isRequested) return builds[buildName]
  }
  return builds.default
}

/** Puts command line arguments in a move convenient format. */
const extractArgs = args => {
  return {
    assetTypes: pick(args, ['addPokemon', 'addInventory', 'addMisc']),
    optsPokemon: pick(args, ['noPokemonRegular', 'noPokemonShiny', 'noPokemonForms', 'noPokemonGender', 'noPokemonEtc', 'pokemonGen']),
    optsInventory: pick(args, ['inventoryGroups', 'addOutline']),
    optsMisc: pick(args, ['miscGroups']),
    optsOutput: pick(args, ['noCSS', 'noImage', 'noHTML', 'outDir', 'outSuffix', 'clsLanguage', 'clsBasename'])
  }
}

/** Checks what type of build the user requested and saves sprites based on cli args. */
const main = async args => {
  const pickedArgs = extractArgs(args)
  const buildScript = getBuildScript(args)
  const result = await buildScript(pickedArgs)
  process.exitCode = result
}

module.exports = main
