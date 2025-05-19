## A dead simple Win/Losses counter

Someone asked me to do this, so I did.

### Commands

You then have a list commands, optional arguments are marked in `[]`:
- `!win [amout:int]`, which will increase the win counter by `[amout]` or `1` if not specified/invalid.
<sub>- aliases: `!wins`</sub>
- `!loss [amount:int]`, which will increase the loss counter by `[amount]` or `1` if not specified/invalid.
<sub>- aliases: `!losses`</sub>
-  `!removewin [amount:int]`, which will decrease the win counter by `[amount]`, or `1` if not specified/invalid.
<sub>-aliases: `!removewins`</sub>
-  `!removeloss [amount:int]`, which will decrease the loss counter by `[amount]`, or `1` if not specified/invalid.
<sub>-aliases: `!removelosses`</sub>
- `!clearwin`, which will clear the win counter.
<sub>-aliases: `!clearwins`</sub>
- `!clearloss`, which will clear the loss counter.
<sub>-aliases: `!clearlosses`</sub>
- `!shuffleemoji`, which will change randomly the emoji, [if enabled](#configuration).


Currently, only mods and the broadcaster can use these commands.

<sub>Please do not write literals `[]` in the command</sub>


### Configuration

To connect to a channel, first use the `channel` query parameter, e.g:  `https://wl.lx.ht?channel=gaysupertf`

You then have multiple flags/options to use.

- `colour=[hexcode:fff]`, which will set the text's colour to the provided hex code. (including the `-` in-between).
- `wColour=[hexcode:fff]`, which will set the win counter text's colour to the provided hex code.
- `lColour=[hexcode:fff]`, which will set the loss counter text's colour to the provided hex code.
- `shouldDisplayEmojis=[true/false]`, whether to display an emoji right next to the counter (silly mode enabled :3)
