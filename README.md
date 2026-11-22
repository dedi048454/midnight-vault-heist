# Midnight Vault — The Grand Museum Heist

Entry for the make.fun bounty **"Make the best heist game"**
(https://make.fun/bounty/best-heist-game-20261122-0559) — $50, 10 places paid.

## The game

A complete top-down stealth heist game that runs offline in a desktop
browser from its own static files — no network, no assets, all art drawn
on canvas and all sounds synthesized with WebAudio.

**Your job:** sneak through the Grand Museum, steal every loot item,
dodge guard and camera vision cones, keep the **alarm below 100%**, then
escape through the green EXIT.

- **3 levels** — Gallery One, The Vault Wing, The Crown Jewels. Guards get
  faster, vision cones get wider, and more loot appears each level.
- **Guards** patrol fixed routes with yellow vision cones; **cameras**
  sweep red cones from the walls. Being seen raises the alarm; hiding
  lets it cool down. Alarm at 100% = caught.
- **Loot:** gold bars ($500), paintings ($750), diamonds ($1,000) and the
  Crown Jewels ($1,500). Level-clear time bonus up to $1,000.
- **Win** by clearing all 3 levels; **lose** by tripping the alarm.
- Title screen, pause (P), restart (R), level-clear and caught screens,
  live HUD with score, loot count, level, timer and alarm meter.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

Move with **WASD** or **arrow keys**. Pause with **P**, restart with **R**,
click / Enter to start.

## How it is built

- `game/index.html` — the whole game (canvas, logic, art, sound)
- `main.ts` — the make.fun entry program (Node 22, stdlib only): copies
  `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — vendored make.fun library, unchanged
- `screenshots/` — real renders of the game's own code
  (`?shot=start`, `?shot=play`, `?shot=end`)

## License

MIT — see `LICENSE`.
