// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const copyTemplateDir = require('copy-template-dir')
const { generateOverview } = require('./overview')
const { generateTeaser } = require('./teaser')
const { pkgPokeSprite } = require('../assets')

/** Generates documentation for this build. */
const generateDocs = async (includedTypes, spriteData, { optsOutput, optsPokemon, pkgDir }) => {
  const overview = generateOverview(includedTypes, spriteData, optsPokemon.pokemonGen)
  const teaser = generateTeaser(includedTypes, spriteData)
  await copyTemplate({ optsOutput, pkgDir, overview, teaser })
  return {
    overview
  }
}

/** Copies over the standard package files (package.json, index.js, documentation) for the pokesprite-spritesheet package. */
const copyTemplate = async ({ optsOutput, pkgDir, overview }) => {
  const srcDir = `${pkgDir}/packages/lib/templates/pokesprite-spritesheet`
  const dstDir = `${optsOutput.outDir}`
  return copyDir(srcDir, dstDir, getTemplateVars(pkgPokeSprite, optsOutput, overview))
}

/** Returns templates to use for copying over templates. */
const getTemplateVars = (pkgPokeSprite, { clsBasename }, overview, teaser) => ({
  version: pkgPokeSprite.version,
  clsBasename,
  overview,
  teaser
})

/** Promisified version of copyTemplateDir. */
const copyDir = async (source, target, vars = {}) => new Promise((resolve, reject) => (
  copyTemplateDir(source, target, vars, (err, files) => {
    if (err) return reject(err, files)
    resolve(files)
  })
))

module.exports = {
  generateDocs
}
