// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { formatGender, formatForm } = require('./formatting')

const generateOverview = ({ addPokemon, addInventory, addMisc }, { pokemon, inventory, misc }, pokemonGen) => {
  const buffer = []
  buffer.push(...getTableHeader(pokemonGen))

  if (addPokemon) {
    buffer.push(getTableGroupHeader('Pokémon box sprites'))

    const groups = Object.entries(pokemon.items
      // Remove all shiny Pokémon (since we'll display regular and shiny side by side)
      .filter(item => item.info.group === 'regular')
      // Group by index number
      .reduce((all, item) => {
        const number = item.info.data.idx
        const items = all[number] || []
        return { ...all, [number]: [...items, item] }
      }, {}))
      .sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1)
    
    // Add rows for each Pokémon in each group.
    groups.forEach(([_, group]) => {
      group.forEach((item, n) => {
        buffer.push(getPokemonRow(item.selector, item.info, n, group.length))
      })
    })
  }

  if (addInventory) {
    buffer.push(getTableGroupHeader('Inventory item sprites'))
    buffer.push(`<tr class="header"><th>–</th><th>Name</th><th colspan="2">Item ID</th><th class="spritesheet-sprite" colspan="2">Sprite</th><th colspan="3">Group</th><th>Selector</th></tr>`)
    inventory.items.forEach(item => buffer.push(getInventoryRow(item.selector, item.info)))
  }
  
  buffer.push(...getTableFooter())
  return buffer.join('\n')
}

const getInventoryRow = (selector, info) => {
  console.log(selector, info)
  return `
    <tr>
      <td></td>
      <td>${info.name}</td>
      <td colspan="2"><code>${info.name}</code></td>
      <td colspan="2">${getSprite(selector)}</td>
      <td colspan="3">${info.group}</td>
      <td><code>${selector}</code></td>
    </tr>
  `
}

const getPokemonRow = (selector, info, n, total) => {
  const { data, genderName, displayGender, isAliasOf, formData } = info
  const { idx, name } = data
  
  const isUnofficialFemaleIcon = genderName === 'f' && formData.has_unofficial_female_icon
  const isUnofficialIcon = formData.is_unofficial_icon
  let formCols = 3
  if (displayGender) {
    formCols -= 1
  }

  return `
    <tr>
      ${n === 0 ? `
        <td rowspan="${total}">#${idx}</td>
        <td rowspan="${total}">${name.eng}</td>
        <td rowspan="${total}">${name.jpn}</td>
        <td rowspan="${total}">${name.jpn_ro}</td>
      ` : ''}
      <td class="image pokemon">${getSprite(selector)}</td>
      <td class="image pokemon">${getSprite(selector, true)}</td>
      ${formatForm(info.formName, formCols, isAliasOf, isUnofficialIcon, isUnofficialFemaleIcon)}
      ${formatGender(genderName, displayGender)}
      <td><code>${selector}</code></td>
    </tr>
  `
}

const getSprite = (selector, isShiny) => `<span class="${selector.split('.').join(' ').trim()}${isShiny ? ` shiny` : ''}"></span>`

const getTableGroupHeader = str => `<tr><th></th><th class="group" colspan="9">${str}</th></tr>`

const getTableHeader = (gen) => splitLines(
  `
  <table class="pokesprite gen${gen} pokesprite-spritesheet">
    <thead>
      <tr class="title"><th></th><th colspan="9">PokéSprite spritesheet overview table</th></tr>
      <tr class="header"><th>Dex</th><th>Name</th><th colspan="2">名前/ローマ字</th><th class="spritesheet-sprite" colspan="2">Sprites</th><th colspan="3">Form</th><th>Selector</th></tr>
    </thead>
    <tbody>
  `
)

const getTableFooter = () => splitLines(
  `
    </tbody>
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
