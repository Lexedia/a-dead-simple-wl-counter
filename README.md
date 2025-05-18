## A dead simple Win/Losses counter

Someone asked me to do this, so I did.

If you want, there's an instance at `https://wl.lx.ht`, you can then use the query param `channel` to set the channel to listen to.
E.g
- `https://wl.lx.ht?channel=gaysupertf`

You then have 2 commands:
- `!win [amout:int]`, which will increase the win counter by `[amout]` or `1` if not specified/invalid.
- `!loss [amount:int]`, which will increase the loss counter by `[amount]` or `1` if not specified/invalid.

Also only mods and the broadcaster can use these commands.

<sub>Please do not write literals `[]` in the command</sub>
