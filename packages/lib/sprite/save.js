// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const fs = require('fs').promises

/**
 * Saves any assets the user generated.
 * 
 * 
 * TODO
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
  if (!optsOutput.noHTML) {
    //outCSS = await saveFile(outFilename(optsOutput, 'css'), optsOutput.outDir, css, false)
  }
  
  console.log(outImage, outCSS);
  console.log('--')
  return 0
}

/**
 * Saves three sprites for the standard build.
 */
const saveStandardBuildAssets = async (files, { optsOutput }) => {
  for (const file of Object.keys(files)) {
    await saveFile(outFilename({ ...optsOutput, outSuffix: file }, 'png'), optsOutput.outDir, files[file].buffer, true)
    await saveFile(outFilename({ ...optsOutput, outSuffix: file }, 'css'), optsOutput.outDir, files[file].css, true)
  }
  return 0
}

/** Returns output filename. */
const outFilename = ({ outSuffix }, ext) => {
  return `pokesprite${outSuffix ? `_${outSuffix}` : ''}.${ext}`
}

/** Saves a file. */
const saveFile = async (fn, path, buffer, binary) => {
  const out = `${path}/${fn}`
  fs.writeFile(out, buffer, binary ? 'binary' : 'utf8')
  return out
}

module.exports = {
  saveAssets,
  saveStandardBuildAssets
}
