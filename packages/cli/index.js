#!/usr/bin/env node

// pokesprite-gen <https://github.com/msikma/pokesprite-gen>
// © MIT license

const { resolve } = require('path')
const { makeArgParser } = require('dada-cli-tools/argparse')
const { ensurePeriod } = require('dada-cli-tools/util/text')
const { readJSONSync } = require('dada-cli-tools/util/fs')

// Path to the application code, i.e. where the top level package.json resides. No trailing slash.
const pkgPath = resolve(`${__dirname}/../../`)
const pkgData = readJSONSync(`${pkgPath}/package.json`)

const parser = makeArgParser({
  version: pkgData.version,
  addHelp: true,
  longHelp: `At least one of --add-{pokemon,inventory,misc} must be passed to generate a
sprite. It's recommended to make a separate spritesheet for each of those
three types, as needed. The 'misc' sprites can not be combined with the
Pokémon and inventory sprite in the same file.

In most cases, you'll want to generate a standard build which makes separate
files for Pokémon, inventory items and misc items, and generates an overview
file with instructions for making these items appear.
`,
  description: ensurePeriod(pkgData.description),
  epilog: 'For more information: <https://github.com/msikma/pokesprite>'
})

parser.addSection('Pokémon options:')
parser.addArgument('--add-pokemon', { help: 'Includes Pokémon sprites in the output.', action: 'storeTrue', dest: 'addPokemon' })
parser.addArgument('--pokemon-gen', { help: 'The sprite generation to use (defaults to latest).', choices: ['7x', '8'], defaultValue: '8', dest: 'pokemonGen' })
parser.addArgument('--no-pokemon-regular', { help: 'Omits non-shiny Pokémon sprites.', action: 'storeTrue', dest: 'noPokemonRegular' })
parser.addArgument('--no-pokemon-shiny', { help: 'Omits shiny Pokémon sprites.', action: 'storeTrue', dest: 'noPokemonShiny' })
parser.addArgument('--no-pokemon-forms', { help: 'Omits all non-default Pokémon forms.', action: 'storeTrue', dest: 'noPokemonForms' })
parser.addArgument('--no-pokemon-gender', { help: 'Omits Pokémon alternate gender sprites.', action: 'storeTrue', dest: 'noPokemonGender' })
parser.addArgument('--no-pokemon-etc', { help: 'Omits misc. sprites (egg, unknown, etc.).', action: 'storeTrue', dest: 'noPokemonEtc' })

parser.addSection('Inventory options:')
parser.addArgument('--add-inventory', { help: 'Includes inventory sprites in the output.', action: 'storeTrue', dest: 'addInventory' })
parser.addArgument('--add-outline', { help: 'Adds a Gen 8 style white outline around the sprites.', action: 'storeTrue', dest: 'addOutline' })
parser.addArgument('--inventory-groups', { help: 'List of inventory groups to include (defaults to all).', metavar: 'GROUP', nargs: '+', dest: 'inventoryGroups' })

parser.addSection('Miscellaneous sprite options:')
parser.addArgument('--add-misc', { help: 'Includes misc. sprite groups (ribbons, marks, etc.) in the output.', action: 'storeTrue', dest: 'addMisc' })
parser.addArgument('--misc-groups', { help: 'List of misc. groups to include (defaults to all).', metavar: 'GROUP', nargs: '+', dest: 'miscGroups' })

parser.addSection('Output options:')
parser.addArgument('--cls-lang', { help: `Language to use for class names (defaults to 'eng').`, defaultValue: 'eng', metavar: 'LANG', dest: 'clsLanguage' })
parser.addArgument('--cls-basename', { help: `Base class name for icons ('pokesprite').`, defaultValue: 'pokesprite', metavar: 'NAME', dest: 'clsBasename' })
parser.addArgument('--no-css', { help: 'Skips CSS file generation.', action: 'storeTrue', dest: 'noCSS' })
parser.addArgument('--no-image', { help: 'Skips image file generation.', action: 'storeTrue', dest: 'noImage' })
parser.addArgument('--out-dir', { help: 'Output directory (defaults to the current directory).', metavar: 'DIR', dest: 'outDir', defaultValue: pkgPath })
parser.addArgument('--out-suffix', { help: `Output filename suffix (defaults to 'sprite').`, metavar: 'STR', dest: 'outSuffix', defaultValue: 'sprite' })

parser.addSection('Preset builds:')
parser.addArgument('--standard-build', { help: `Builds Pokémon, inventory and misc as separate files.`, action: 'storeTrue', dest: 'buildStandard' })

const parsed = { ...parser.parseArgs() }

// Runs the main program with parsed command line arguments.
require('pokesprite-gen-lib')(parsed, { pkgData, baseDir: pkgPath })
