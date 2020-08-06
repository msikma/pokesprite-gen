// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const generateExports = require('./generate')
const docsExports = require('./docs')
const saveExports = require('./save')
const assetsExports = require('./assets')

module.exports = {
  ...generateExports,
  ...saveExports,
  ...assetsExports,
  ...docsExports
}
