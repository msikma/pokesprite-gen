// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const fg = require('fast-glob')
const { keyList, pokemonDirSet } = require('./util.js')

/** The Pokémon data file containing a list of species and forms. */
const dataPokedex = require('pokesprite-images/data/pokemon.json')
/** Other Pokémon-sized sprites (egg, egg-manaphy, etc.). */
const dataPokemonEtc = require('pokesprite-images/data/other-sprites.json')
/** Path to the PokéSprite files. */
const pathPokeSprite = require('pokesprite-images').baseDir

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
const getSpriteFiles = async ({ addPokemon, addInventory, addMisc }, { optsPokemon, optsInventory, optsMisc }) => {
  const [dataPokemon, pokemonFiles] = await getPokemonFiles(addPokemon, optsPokemon, 'pokemon', `pokemon-gen${optsPokemon.pokemonGen}`)
  const [dataInventoryGroups, inventoryFiles] = await getInventoryFiles(addInventory)
  const [dataMiscGroups, miscFiles] = await getMiscFiles(addMisc)
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
  if (!includeFiles) return []
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

        // Iterate over only the 'default' gender, or it plus a female gender sprite.
        const genderList = addGenders && formData.has_female ? ['$', 'f'] : ['$']
        for (const genderName of genderList) {
          const base = [basename, formName === '$' ? null : formName].filter(i => i).join('-')
          const path = `${pathPokeSprite}/${dir}/${groupName}${genderName === 'f' ? '/female' : ''}/${base}.${PKM_FILE_EXT}`
          const fileData = {
            type,
            dir,
            data: pkm,
            name: base,
            basename,
            ext: PKM_FILE_EXT,
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
 * Returns an object of all sprite groups, and an object containing sprite data by file path.
 */
const globAssets = async (includeFiles, type, dir, onlyGroups = null) => {
  if (!includeFiles) return [{}, {}]
  const files = await fg(`${dir}/**/*.png`, { cwd: pathPokeSprite, onlyFiles: true, followSymbolicLinks: false })
  const allFiles = {}
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
    allFiles[path] = fileData
  }
  return [groups, allFiles]
}

/**
 * Returns miscellaneous sprites (ribbons, marks, etc.).
 */
const getMiscFiles = async (includeFiles, groups = null) => {
  return globAssets(includeFiles, 'misc', 'misc', groups)
}

/**
 * Returns inventory sprites.
 */
const getInventoryFiles = async (includeFiles, addOutline = false, groups = null) => {
  return globAssets(includeFiles, 'inventory', addOutline ? 'items-outline' : 'items', groups)
}

module.exports = {
  dataPokedex,
  pathPokeSprite,
  getSpriteFiles,
  getPokemonFiles,
  getInventoryFiles,
  getMiscFiles
}
