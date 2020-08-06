// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { pick } = require('lodash')
const { log } = require('dada-cli-tools/log')
const { generateSprite, generateDocs, getSpriteAssets, saveAssets, saveStandardBuildAssets } = require('./generator')

/** List of special build functions. */
const builds = {
  /** Default script - uses all the user's cli args. */
  default: async ({ assetTypes, optsPokemon, optsInventory, optsMisc, optsOutput }) => {
    const assetData = await getSpriteAssets(assetTypes, { optsPokemon, optsInventory, optsMisc })
    const spriteData = await generateSprite(assetTypes, assetData, { optsOutput })
    return saveAssets(spriteData, { optsOutput })
  },
  /** Standard build - creates separate files for Pokémon, inventory items and misc sprites. Published to npm. */
  buildStandard: async (options, baseDir) => {
    options.optsPokemon = { ...options.optsPokemon, pokemonGen: '8' }
    const addAssets = { addPokemon: true, addInventory: true, addMisc: true }
    const assetData = await getSpriteAssets(addAssets, options)
    const pokemon = await generateSprite({ addPokemon: true }, assetData, options)
    const inventory = await generateSprite({ addInventory: true }, assetData, options)
    const misc = await generateSprite({ addMisc: true }, assetData, options)
    const sprites = { pokemon, inventory, misc }
    await generateDocs(addAssets, sprites, { ...options, pkgDir: baseDir })
    return saveStandardBuildAssets(sprites, options)
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
    optsOutput: pick(args, ['noCSS', 'noImage', 'outDir', 'outSuffix', 'clsLanguage', 'clsBasename'])
  }
}

/** Checks what type of build the user requested and saves sprites based on cli args. */
const main = async (args, { baseDir }) => {
  const pickedArgs = extractArgs(args)
  const buildScript = getBuildScript(args)
  const result = await buildScript(pickedArgs, baseDir)
  process.exitCode = result
}

module.exports = main
