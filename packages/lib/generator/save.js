// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { saveFile } = require('./util')

/**
 * Saves any assets the user generated.
 */
const saveAssets = async ({ buffer, image, css }, { optsOutput }) => {
  let outImage
  let outCSS
  console.log(optsOutput)
  if (!optsOutput.noImage) {
    outImage = await saveFile(outFilename(optsOutput, 'png'), optsOutput.outDir, buffer, true)
  }
  if (!optsOutput.noCSS) {
    console.log(css)
    outCSS = await saveFile(outFilename(optsOutput, 'css'), optsOutput.outDir, css, false)
  }
  console.log(outImage, outCSS);
  console.log('--')
  return 0
}

/**
 * Saves three sprites for the standard build.
 */
const saveStandardBuildAssets = async (files, { optsPokemon, optsOutput }) => {
  for (const file of Object.keys(files)) {
    const genSuffix = file === 'pokemon' ? `gen${optsPokemon.pokemonGen}` : null
    await saveFile(outFilename({ ...optsOutput, outSuffixes: [file, genSuffix] }, 'png'), `${optsOutput.outDir}/assets`, files[file].buffer, true)
    await saveFile(outFilename({ ...optsOutput, outSuffixes: [file, genSuffix] }, 'css'), `${optsOutput.outDir}/assets`, files[file].css, false)
  }
  return 0
}

/** Returns output filename. */
const outFilename = ({ outSuffixes }, ext) => {
  const suffixes = outSuffixes.filter(n => n)
  return `pokesprite${suffixes.length > 0 ? '-' : ''}${suffixes.join('-')}.${ext}`
}

module.exports = {
  saveAssets,
  saveStandardBuildAssets
}
