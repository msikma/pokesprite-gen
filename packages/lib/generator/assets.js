// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const fg = require('fast-glob')
const { splitFilename } = require('dada-cli-tools/util/fs')
const { invert } = require('lodash')
const { keyList, pokemonDirSet, getBaseFromFn } = require('./util.js')

/** The Pokémon data file containing a list of species and forms. */
const dataPokedex = require('pokesprite-images/data/pokemon.json')
/** Other Pokémon-sized sprites (egg, egg-manaphy, etc.). */
const dataPokemonEtc = require('pokesprite-images/data/other-sprites.json')
/** Inventory item sprites. Reversed; 'group/item' => 'item_id'. */
const dataItems = invert(require('pokesprite-images/data/item-map.json'))
/** Miscellaneous sprites (ribbons, marks, etc.). */
const dataMisc = require('pokesprite-images/data/misc.json')
/** Path to the PokéSprite files. */
const pathPokeSprite = require('pokesprite-images').baseDir
/** PokéSprite package file (for the version). */
const pkgPokeSprite = require('pokesprite-images/package.json')

/** The slug language used for filenames. */
const PKM_FILE_SLUG_LANG = 'eng'
/** The filetype used for Pokémon icons. */
const PKM_FILE_EXT = 'png'

/**
 * Returns all information needed to generate a sprite.
 * 
 * This includes information on Pokémon, inventory items and miscellaneous sprites,
 * and lists of files to include in the spritesheet.
 */
const getSpriteAssets = async ({ addPokemon, addInventory, addMisc }, { optsPokemon, optsInventory, optsMisc }) => {
  const [dataPokemon, pokemonFiles] = await getPokemonFiles(addPokemon, optsPokemon, 'pokemon', `pokemon-gen${optsPokemon.pokemonGen}`)
  const [dataInventoryGroups, inventoryFiles] = await getInventoryFiles(addInventory, optsInventory.inventoryGroups, optsInventory.addOutline)
  const [dataMiscGroups, miscFiles] = await getMiscFiles(addMisc, optsMisc.miscGroups)
  const fileInfo = { pokemonFiles, inventoryFiles, miscFiles }

  return {
    dataPokemon,
    dataInventoryGroups,
    dataMiscGroups,
    fileInfo
  }
}

/**
 * Returns Pokémon sprites.
 * 
 * Unlike inventory items and miscellaneous sprites, Pokémon sprites have more data
 * and are generated from the 'pokemon.json' file included in PokéSprite.
 * 
 * Each item has the following data:
 * 
 *   { type: 'pokemon',
 *     dir: 'pokemon-gen8',
 *     data: { ... data from 'pokemon.json' },
 *     basename: 'fearow',
 *     ext: 'png',
 *     path: '/path/to/pokesprite/pokemon-gen8/shiny/abomasnow-mega.png' }
 * 
 * Returns a list of all Pokémon, and an object containing sprite data by file path.
 */
const getPokemonFiles = async (includeFiles, opts = {}, type = 'pokemon', dir = 'pokemon-gen8') => {
  if (!includeFiles) return [[], {}]
  const dex = Object.keys(dataPokedex).sort()
  const allFiles = {}
  const pokemon = []
  const set = pokemonDirSet(dir)

  const groups = keyList([!opts.noPokemonRegular, 'regular'], [!opts.noPokemonShiny, 'shiny'])
  const addForms = !opts.noPokemonForms
  const addGenders = !opts.noPokemonGender
  const addEtc = !opts.noPokemonEtc

  // Iterate over 'regular' and 'shiny'.
  for (const groupName of groups) {

    // Iterate over each Pokémon in the dex.
    for (const n of dex) {
      const pkm = dataPokedex[n]
      const basename = pkm.slug[PKM_FILE_SLUG_LANG]

      // Iterate over every form.
      for (const [formName, formData] of Object.entries(pkm[set].forms)) {
        if (!addForms && formName !== '$') continue
        if (addForms && formData.is_alias_of) continue

        // Get a list of form names that are aliases of this one. E.g. ['totem', 'totem-alola'] for Raticate's default form.
        const formAliases = Object.entries(pkm[set].forms).filter(([fN, fD]) => fD.is_alias_of === formName).map(f => f[0])

        // Iterate over only the 'default' gender, or it plus a female gender sprite.
        const genderList = addGenders && formData.has_female ? ['m', 'f'] : ['$']
        for (const genderName of genderList) {
          const base = [basename, formName === '$' ? null : formName].filter(i => i).join('-')
          const path = `${pathPokeSprite}/${dir}/${groupName}${genderName === 'f' ? '/female' : ''}/${base}.${PKM_FILE_EXT}`
          const fileData = {
            type,
            dir,
            data: pkm,
            name: base,
            group: groupName,
            formAliases: ['$', ...formAliases],
            formData,
            genderName,
            displayGender: genderList.length > 1,
            formName,
            basename,
            ext: PKM_FILE_EXT,
            isAliasOf: null,
            path
          }
      
          pokemon.push(fileData)
          allFiles[path] = fileData
        }
      }
    }
  }
  //dataPokemonEtc
  return [pokemon, allFiles]
}

/**
 * Returns an object of assets by globbing a directory.
 * 
 * This is used to retrieve the inventory items and the miscellaneous sprites.
 * The following format is used per item:
 * 
 *   { type: 'inventory',
 *     dir: 'items',
 *     group: 'apricorn',
 *     name: 'blue',
 *     ext: 'png',
 *     path: '/path/to/pokesprite/items/apricorn/blue.png' }
 * 
 * Returns an object of all sprite groups.
 */
const globAssets = async (includeFiles, type, dir, onlyGroups = null) => {
  if (!includeFiles) return [{}, {}]
  const files = await fg(`${dir}/**/*.png`, { cwd: pathPokeSprite, onlyFiles: true, followSymbolicLinks: false })
  const groups = {}
  for (const file of files) {
    const [group, ...fnSegments] = file.split('/').slice(1)
    const fn = fnSegments.join('/')
    if (onlyGroups != null && !~onlyGroups.indexOf(group)) continue
    if (!groups[group]) groups[group] = []

    const [fnBase, fnExt] = fn.split('.')
    const name = fnBase.replace(/(^(.*)\/)?(.*)$/, '$3-$2').replace(/[-]+$/, '')
    const path = `${pathPokeSprite}/${dir}/${group}/${fn}`

    const fileData = {
      type,
      dir,
      group,
      name,
      ext: fnExt,
      path
    }

    groups[group].push(fileData)
  }
  return groups
}

/**
 * Returns miscellaneous sprites (ribbons, marks, etc.).
 */
const getMiscFiles = async (includeFiles, onlyGroups = null, dir = 'misc', type = 'misc', only1x = true) => {
  if (!includeFiles) return [{}, {}]
  const allFiles = {}
  const groups = {}
  
  for (const [groupName, groupFiles] of Object.entries(dataMisc)) {
    if (onlyGroups != null && !~onlyGroups.indexOf(groupName)) continue
    if (!groups[groupName]) groups[groupName] = []

    for (const item of groupFiles) {
      for (const [gen, res] of Object.entries(item.resolution)) {
        if (res !== '1x' && only1x) continue
        const filesGen = item.files[gen]
        const files = Array.isArray(filesGen) ? filesGen : [filesGen]
        for (const file of files) {
          const path = `${pathPokeSprite}/${dir}/${file}`
          const name = getBaseFromFn(file)
          const { extension } = splitFilename(file)
          const fileData = {
            type,
            dir,
            data: item,
            name,
            fileGen: gen,
            fileResolution: res,
            group: groupName,
            ext: extension,
            path
          }

          groups[groupName].push(fileData)
          allFiles[path] = fileData
        }
      }
    }
  }

  return [groups, allFiles]
}

/**
 * Returns inventory sprites. Same format as globAssets(), except that an item ID is included as well.
 * 
 * Returns an object of all inventory sprite groups, and an object containing sprite data by file path.
 */
const getInventoryFiles = async (includeFiles, onlyGroups = null, addOutline = false) => {
  const groups = await globAssets(includeFiles, 'inventory', addOutline ? 'items-outline' : 'items', onlyGroups)
  const allFiles = {}

  // Add item ID where applicable (some are null), and add all items to the 'allFiles' object by path.
  for (const group of Object.values(groups)) {
    for (const item of group) {
      const { group, name, path } = item
      const groupAndName = `${group}/${name}`
      const itemID = dataItems[groupAndName]
      item.itemID = itemID
      allFiles[path] = item
    }
  }
  return [groups, allFiles]
}

module.exports = {
  dataPokedex,
  pathPokeSprite,
  pkgPokeSprite,
  getSpriteAssets,
  getPokemonFiles,
  getInventoryFiles,
  getMiscFiles
}
