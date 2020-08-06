// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const layout = require('layout')

/** No-op for sorting. */
const sort = items => items

/** Place items horizontally with a maximum width. */
const placeItemsWithMaxWidth = maxWidth => items => {
  let x = 0
  let y = 0
  let maxHeight = 0
  
  items.forEach(item => {
    if (x + item.width > maxWidth) {
      x = 0
      y += maxHeight
      maxHeight = 0
    }
    item.x = x
    item.y = y

    x += item.width
    maxHeight = Math.max(maxHeight, item.height)
  })

  return items
}

const addPokeSpriteAlgorithm = () => {
  // Adds a layout that goes left-right with a maximum width of 2178 (2176 + 2px padding accounting for 32 sprites of 68px wide).
  layout.addAlgorithm('pokesprite-left-right', { sort, placeItems: placeItemsWithMaxWidth(2178) })
}

module.exports = {
  addPokeSpriteAlgorithm
}
