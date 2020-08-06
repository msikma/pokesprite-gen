// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const Spritesmith = require('spritesmith')
const { addPokeSpriteAlgorithm } = require('./layout')

/** Whether the PokéSprite algorithm has been added to Spritesmith yet. */
let SPRITESMITH_IS_PREPARED = false

/**
 * Runs Spritesmith and returns the result async.
 */
const runSpritesmith = (sprites) => new Promise((resolve, reject) => {
  prepareSpritesmith()
  Spritesmith.run({
    src: sprites,
    padding: 2,
    algorithm: 'pokesprite-left-right'
  }, (err, result) => {
    if (err) return reject(err)
    return resolve(result)
  });
})

/**
 * Adds the PokéSprite algorithm to Spritesmith.
 * 
 * Since Spritesmith is stateful we have to do this once ahead of time.
 */
const prepareSpritesmith = () => {
  if (SPRITESMITH_IS_PREPARED) return
  addPokeSpriteAlgorithm()
  SPRITESMITH_IS_PREPARED = true
}

module.exports = {
  runSpritesmith
}
