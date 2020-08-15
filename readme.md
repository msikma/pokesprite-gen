# pokesprite-gen

Script for generating a spritesheet from the [PokéSprite](https://github.com/msikma/pokesprite) image assets.

This script is used to generate [pokesprite-spritesheet](https://github.com/msikma/pokesprite-spritesheet/). See that repo for more information.

## Usage

See `pokesprites-gen.js --help` for usage information:

```
usage: pokesprite-gen.js [-h] [-v] [--add-pokemon] [--pokemon-gen {7x,8}]
                         [--no-pokemon-regular] [--no-pokemon-shiny]
                         [--no-pokemon-forms] [--no-pokemon-gender]
                         [--no-pokemon-etc] [--add-inventory] [--add-outline]
                         [--inventory-groups GROUP [GROUP ...]] [--add-misc]
                         [--misc-groups GROUP [GROUP ...]] [--cls-lang LANG]
                         [--cls-basename NAME] [--no-css] [--no-image]
                         [--out-dir DIR] [--out-suffix STR] [--standard-build]

Spritesheet generator for efficiently including PokéSprite images in websites.

At least one of --add-{pokemon,inventory,misc} must be passed to generate a
sprite. It's recommended to make a separate spritesheet for each of those
three types, as needed. The 'misc' sprites can not be combined with the
Pokémon and inventory sprite in the same file.

In most cases, you'll want to generate a standard build which makes separate
files for Pokémon, inventory items and misc items, and generates an overview
file with instructions for making these items appear.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.

Pokémon options:
  --add-pokemon         Includes Pokémon sprites in the output.
  --pokemon-gen {7x,8}  The sprite generation to use (defaults to latest).
  --no-pokemon-regular  Omits non-shiny Pokémon sprites.
  --no-pokemon-shiny    Omits shiny Pokémon sprites.
  --no-pokemon-forms    Omits all non-default Pokémon forms.
  --no-pokemon-gender   Omits Pokémon alternate gender sprites.
  --no-pokemon-etc      Omits misc. sprites (egg, unknown, etc.).

Inventory options:
  --add-inventory       Includes inventory sprites in the output.
  --add-outline         Adds a Gen 8 style white outline around the sprites.
  --inventory-groups GROUP [GROUP ...]
                        List of inventory groups to include (defaults to all).

Miscellaneous sprite options:
  --add-misc            Includes misc. sprite groups (ribbons, marks, etc.) 
                        in the output.
  --misc-groups GROUP [GROUP ...]
                        List of misc. groups to include (defaults to all).

Output options:
  --cls-lang LANG       Language to use for class names (defaults to 'eng').
  --cls-basename NAME   Base class name for icons ('pokesprite').
  --no-css              Skips CSS file generation.
  --no-image            Skips image file generation.
  --out-dir DIR         Output directory (defaults to the current directory).
  --out-suffix STR      Output filename suffix (defaults to 'sprite').

Preset builds:
  --standard-build      Builds Pokémon, inventory and misc as separate files.

For more information: <https://github.com/msikma/pokesprite>
```

Generating the [pokesprite-spritesheet](https://github.com/msikma/pokesprite-spritesheet/) package is done through the `--standard-build` option.

## License

© MIT license
