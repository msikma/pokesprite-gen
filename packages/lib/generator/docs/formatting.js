// pokesprite-gen-lib <https://github.com/msikma/pokesprite-gen>
// © MIT license

const genderNames = { m: 'Male', f: 'Female' }

/** Returns a <td> for a Pokémon's gender. */
const formatGender = (genderName, displayGender) => {
  if (!displayGender) return ''
  return `<td title="${genderNames[genderName]} sprite" class="min form-badge gender-${genderName}"><span>${genderName.toUpperCase()}</span></td>`
}

/** Returns a <td> for a Pokémon's form. */
const formatForm = (formName, formCols, isAliasOf, isUnofficialIcon, isUnofficialFemaleIcon) => {
  const isAlias = isAliasOf != null && isAliasOf !== formName
  const formContent = formName === '$' ? '–' : formName

  let inner = ''
  if (isAlias)
    inner = wrapInAttr(`Alias of ${isAliasOf === '$' ? 'default form' : `&quot;${isAliasOf}&quot;`}`, formContent, false)
  else if (isUnofficialIcon)
    inner = wrapInAttr(`Unofficial icon (see below)`, formContent, true)
  else if (isUnofficialFemaleIcon)
    inner = wrapInAttr(`Unofficial female icon (see below)`, formContent, true)
  else
    inner = formContent
  
  return `
    <td colspan="${formCols}">
      ${inner}
    </td>
  `
}

/** Wraps content inside of an <attr> tag. Used by formatForm() to indicate sprite notes. */
const wrapInAttr = (title, content, isDoubleDagger = false) => {
  return `<attr title="${title}"><span>${content}</span>${isDoubleDagger ? '‡' : '†'}</attr>`
}

module.exports = {
  formatGender,
  formatForm
}
