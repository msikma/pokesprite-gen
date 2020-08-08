// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { formatGender, formatGeneration, formatForm } = require('./formatting')

/**
 * Generates an overview page of all sprites included in the generated spritesheet.
 * 
 * Unlike the main PokéSprite overview pages, all included sprites are on one page for simplicity.
 */
const generateOverview = ({ addPokemon, addInventory, addMisc }, { pokemon, inventory, misc }, pokemonGen) => {
  const buffer = []
  buffer.push(...getTableHeader(pokemonGen))

  if (addPokemon) {
    buffer.push(`<tbody class="gen8">`)
    buffer.push(getTableGroupHeader('Pokémon box sprites'))

    // Take only non-shiny Pokémon (since we'll display regular and shiny side by side)
    // and group them by dex number to get evolution families, then sort them.
    const groups = Object.entries(pokemon.items
      // Remove all shiny Pokémon
      .filter(item => item.info.group === 'regular')
      // Group by index number
      .reduce((all, item) => {
        const number = item.info.data.idx
        const items = all[number] || []
        return { ...all, [number]: [...items, item] }
      }, {}))
      .sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1)
    
    // Filter out all Pokémon to get the alternate items such as "egg", "mega", etc.
    const etc = Object.values(pokemon.items).filter(item => item.info.group === 'etc')
    
    // Add rows for each Pokémon in each group.
    groups.forEach(([_, group]) => {
      group.forEach((item, n) => {
        buffer.push(getPokemonRow(item.selector, item.info, true, n, group.length))
      })
    })

    // Add rows for all alternate items.
    etc.forEach(item => {
      buffer.push(getPokemonRow(item.selector, item.info, false))
    })

    buffer.push(`</tbody>`)
  }

  if (addInventory) {
    buffer.push(`<tbody>`)
    buffer.push(getTableGroupHeader('Inventory item sprites'))
    buffer.push(`<tr class="header"><th></th><th>Name</th><th colspan="2">Item ID</th><th class="spritesheet-sprite" colspan="2">Sprite</th><th colspan="3">Group</th><th>Selector</th></tr>`)
    inventory.items.forEach(item => buffer.push(getInventoryRow(item.selector, item.info)))
    buffer.push(`</tbody>`)
  }

  if (addMisc) {
    buffer.push(`<tbody class="variable-height">`)
    buffer.push(getTableGroupHeader('Miscellaneous sprites'))
    buffer.push(`<tr class="header"><th></th><th>Name</th><th colspan="2">名前</th><th class="spritesheet-sprite" colspan="2">Sprite</th><th colspan="3">Gen</th><th>Selector</th></tr>`)
    misc.items.forEach(item => buffer.push(getMiscRow(item.selector, item.info)))
    buffer.push(`</tbody>`)
  }
  
  buffer.push(...getTableFooter())
  return buffer.join('\n')
}

/** Returns a <tr> for a Pokémon. */
const getPokemonRow = (selector, info, isRegularPokemon = true, n = 0, total = 1) => {
  const { data, genderName, displayGender, isAliasOf, formData } = info
  const { idx, name } = data
  
  const isUnofficialFemaleIcon = genderName === 'f' && formData && formData.has_unofficial_female_icon
  const isUnofficialIcon = formData && formData.is_unofficial_icon
  let formCols = 3
  if (displayGender) {
    formCols -= 1
  }

  return `
    <tr>
      ${isRegularPokemon ? `
        ${n === 0 ? `
          <td rowspan="${total}">${idx ? `#${idx}` : ''}</td>
          <td rowspan="${total}">${name.eng}</td>
          <td rowspan="${total}">${name.jpn}</td>
          <td rowspan="${total}">${name.jpn_ro}</td>
        ` : ''}
        <td class="image pokemon">${getSprite(selector)}</td>
        <td class="image pokemon shiny">${getSprite(selector, true)}</td>
        ${formatForm(info.formName, formCols, isAliasOf, isUnofficialIcon, isUnofficialFemaleIcon)}
        ${formatGender(genderName, displayGender)}
      ` : `
        ${n === 0 ? `
          <td rowspan="${total}">${idx ? `#${idx}` : ''}</td>
          <td rowspan="${total}">${name.eng}</td>
          <td rowspan="${total}" colspan="2" title="${name.jpn_ro}">${name.jpn}</td>
        ` : ''}
        <td class="image pokemon centered" colspan="2">${getSprite(selector)}</td>
        <td colspan="3">–</td>
      `}
      <td class="selector"><code>${selector}</code></td>
    </tr>
  `
}

/** Returns a <tr> for an inventory item. */
const getInventoryRow = (selector, info) => {
  const { name, group, itemID } = info
  return `
    <tr>
      <td></td>
      <td>${name}</td>
      <td colspan="2" class="item-id">${itemID ? `<code>${itemID}</code>` : '–'}</td>
      <td colspan="2" class="image item">${getSprite(selector)}</td>
      <td colspan="3">${group}</td>
      <td class="selector"><code>${selector}</code></td>
    </tr>
  `
}

/** Returns a <tr> for a miscellaneous item. */
const getMiscRow = (selector, info) => {
  const { data, fileGen, fileResolution } = info
  return `
    <tr>
      <td></td>
      <td>${data.name.eng}</td>
      <td colspan="2">${data.name.jpn}</td>
      <td colspan="2" class="image item">${getSprite(selector)}</td>
      <td colspan="3">${formatGeneration(fileGen)}</td>
      <td class="selector"><code>${selector}</code></td>
    </tr>
  `
}

/** Returns a PokéSprite <span> sprite for a certain selector. */
const getSprite = (selector, isShiny) => `<span class="${selector.split('.').join(' ').trim()}${isShiny ? ` shiny` : ''}"></span>`

/** Returns a header for a new section in the table. */
const getTableGroupHeader = str => `<tr><th></th><th class="group" colspan="9">${str}</th></tr>`

/** Returns the main table top header. */
const getTableHeader = (gen) => splitLines(
  `
  <table class="pokesprite pokesprite-spritesheet">
    <thead>
      <tr class="title"><th></th><th colspan="9">PokéSprite spritesheet overview table</th></tr>
      <tr class="header"><th>Dex</th><th>Name</th><th colspan="2">名前/ローマ字</th><th class="spritesheet-sprite" colspan="2">Sprites</th><th colspan="3">Form</th><th>Selector</th></tr>
    </thead>
  `
)

/** Returns the main table bottom footer. */
const getTableFooter = () => splitLines(
  `
    <tfoot>
      <tr>
        <td></td>
        <td colspan="9">
          <div class="footnote">
            <p>For more information on using these sprites, see <a href="#">the project page on Github</a>.</p>
            <p>†: form is an alias of another form and doesn't have a separate image.</p>
            <p>‡: this icon is unofficial (not directly lifted from the games; only applies to non-shiny sprites, as shiny sprites are all unofficial).</p>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
  `
)

/** Splits HTML segments into separate lines. */
const splitLines = str => str.trim().split('\n')

module.exports = {
  generateOverview
}
