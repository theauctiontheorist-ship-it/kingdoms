# Age of AI: Kingdoms

A browser real-time strategy game inspired by **Age of Empires II**, built for **phones and desktop**.
Single player against computer opponents — no install, no server.

**▶ Play:** https://robjos1-coder.github.io/age-of-ai-kingdoms/ *(once GitHub Pages is enabled)*

## Easy-play edition (changes in this fork)

- **Quick Play** button: one tap starts a 1 vs 1 game against an Easy AI on a small map.
- **Two civilizations** only: **Britons** (archers) and **Franks** (cavalry). Older saves with other civilizations still load.
- **Simpler New Game screen**: pick a civilization card, an opponent level and a map. Players, teams and rules are under *More options*.
- **Beginner tips**: a 9-step guide during your first games (Town Center → houses → villagers → wood → barracks → Feudal Age → army → attack), plus a warning when your population is full.
- **Easy-play helpers** (all on by default, all can be turned off in Settings → Easy play):
  - Idle villagers find work on their own, balancing food, wood and gold. When wild food runs out they build a Mill and Farms.
  - A villager builds a House automatically when population is nearly full.
  - Town Centers start with auto-train villagers on.
  - A green ✔ side button sends every idle villager back to work.
- **Faster on phones**: phones default to the light classic graphics (about 1–2 s to start instead of downloading ~25 MB of textures), Low quality on most phones, and **auto graphics** that steps quality down if the frame rate stays under ~28 fps.

## Features

- **Four ages** — Dark, Feudal, Castle, Imperial — with the AoE2 "two buildings + resources" advancement rule; buildings change style each age.
- **10 civilizations** (Britons, Franks, Teutons, Mongols, Byzantines, Japanese, Vikings, Saracens, Persians, Chinese) with bonuses, unique units and unique technologies.
- **~45 unit types**: militia → champion line, spearman → halberdier, archers, skirmishers, cavalry archers, hand cannoneers, scouts → hussars, knights → paladins, camels, rams, mangonels/onagers, scorpions, bombard cannons, trebuchets (pack/unpack), monks, fishing ships, transports, galleys/galleons, fire galleys, cannon galleons, and 10 unique units.
- **~80 technologies**: Loom, Wheelbarrow, farming/woodcutting/mining upgrades, Blacksmith attack & armour lines, University, Monastery, unit upgrade lines, Conscription, unique techs.
- AoE2-style **combat**: melee/pierce armour, attack bonuses, counters, splash damage, high-ground bonus, garrisoned buildings firing arrows.
- **Economy**: sheep herding, deer, boar (fight back!), berries, farms with auto-reseed, shore & deep fishing, gold, stone, market trading with dynamic prices.
- **Monks & relics**: healing, conversion ("wololo"), relics generate gold in Monasteries.
- **Walls & gates**, watch towers, castles, town bell, garrisoning, transports, stances, patrol, attack-move, attack ground, formations, control groups.
- **Victory**: conquest, wonder (hold 400 s), or all relics (hold 400 s).
- **Maps**: Arabia, Black Forest, Lakes, Coastal, Highland, Oasis — 4 sizes, up to 6 players, teams, 4 AI difficulties.
- **Fog of war**, explored terrain, minimap, autosave + 3 save slots, classic cheat codes (`lumberjack`, `robin hood`, `marco`, `aegis`…).
- Default-on **realistic graphics**, with photographic PBR textures, detailed instanced models, natural HDR daylight, soft shadows, animated foliage, and reflective water. The original art style remains selectable in Settings.
- Animated units, fire/smoke/dust effects, drifting cloud shadows.
- Installable as an app (PWA) and works offline after the first load.

## Controls

**Touch:** tap to select · tap ground/enemy/resource to command · two-finger drag to scroll · pinch to zoom · twist to rotate · long-press + drag to box-select · long-press a button for info.
**Mouse/keyboard:** left-click select, drag box, right-click command, arrows scroll, wheel zoom, PageUp/PageDown rotate, grid hotkeys (Q W E R…), `.` idle villager, `,` army, `H` Town Center, Ctrl+1–9 groups, `Enter` cheat/chat.

The minimap starts small at the bottom of the screen; tap it to expand along the left edge, then tap or drag the larger map to move the camera. Close it with × or tap outside. Selection information starts as a compact card with health, combat stats and a brief status (food remaining for sheep). Tap the card to open full details or the training queue. Bottom panels sit flush with the screen edge; stats and command labels use the lower strip while action buttons remain above the phone's home indicator. With villagers selected, tapping a claimed sheep gathers food; with no villagers selected, the sheep can still be selected and moved.

## Development

```bash
npm install
npm run dev        # http://localhost:5299
npm run build      # production build in dist/
npm run check:viewport  # rotation, camera proportions and canvas sizing regression checks
npm run check:interaction  # mobile sheep commands and food harvesting regression checks
node --import tsx scripts/simtest.ts 30 arabia 42   # headless AI-vs-AI soak test
```

Open `#gallery`, `#gallery=buildings` or `#gallery=misc` on the dev server to browse every model.
Add `-realism` to preview the new art, for example `#gallery=buildings-realism`, `#gallery=misc-realism`, or `#gallery=people:villager-realism`.
The building/resource galleries include a model selector for close inspection.
Animated people also have a focus selector. Add a villager appearance to inspect it, for example `#gallery=people:villager:f1-realism` for a woman or `#gallery=people:villager:m2-realism` for a man.
On the dev server, add `?graphicsStats` to log average frame rate, rendering CPU time and triangle count every four seconds while testing settings.

### Realistic graphics

**Settings → Realistic graphics** is on by default, including for existing preferences that predate this option. It switches immediately during a match and is saved locally. The game simulation, collision sizes, save format and GUI artwork are unchanged.

The realistic world uses local 1K photographic scans packed into padded texture atlases: color, OpenGL normals and ambient occlusion/roughness/metalness. Ground surfaces blend grass, mud, sand, forest litter, snow and rock; greener maps use a separate lush grass scan. Material textures cover timber, masonry, plaster, roofs, bark, metal, linen, leather and wool. Higher polygon geometry adds leaf canopies and branches, rounded people and animals, sheep fleece, framed windows, roof courses, coopered barrels, paving, ship rigging and curved sails. Sheep render about 18% smaller than in classic mode without changing their gameplay size.

Water uses two animated normal layers, depth-dependent color/transparency, shoreline foam, HDR reflections and periodically refreshed planar reflections of the world. Fog of war applies to terrain, models and reflections.

Realistic people use slimmer adult proportions, smaller anatomically shaped heads, fitted hair, shaped hands, collars, garment seams and aprons. Women's blouses are muted teal, visibly distinct from every skin tone. Gold and stone are fractured, partly buried rock outcrops with mineral seams on their faces rather than smooth rocks with oversized nuggets.

AoE4 screenshots informed the softer daylight, greener coastal terrain and atmospheric depth at the wide RTS camera angle. **Settings → Atmospheric haze** is also on by default. Haze is calculated per vertex in the existing world shaders, blended before fog of war, and scales with camera zoom. It adds no render pass, framebuffer or texture sampling. Turning it off applies immediately without rebuilding the world.

Quality controls pixel density, shadows, texture resolution and reflection resolution/update rate. Trees use fewer, larger leaf groups at wider zooms and on lower quality settings, preserving canopy coverage. High uses full atlases and 4096px shadows close up, dropping to 2048px at wider views; Medium halves atlas dimensions and uses smaller reflections; Low uses quarter-size atlases, reduced ground vegetation and environment reflections without a planar reflection pass or shadows. The first realistic load downloads roughly 25 MB of local textures and lighting, then the PWA caches them for offline use.

Run `npm run check:graphics` to validate both model libraries. To regenerate the bundled scans, install Pillow and run `python scripts/import-realism-assets.py`. The importer caches downloads in ignored `.asset-cache/`; it is not used by the running game. Exact sources and original download URLs are recorded in `public/realism/sources.json`.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`
(set **Settings → Pages → Source: GitHub Actions** once).

## Credits

- Inspired by and forked in spirit from [alexvilelabah/age-of-ai](https://github.com/alexvilelabah/age-of-ai) (MIT). The original music tracks in `public/music/` come from that project.
- Extra medieval music (Settings → Extra music tracks) by RandomMind, CodeManu and Spring, released [CC0](https://creativecommons.org/publicdomain/zero/1.0/) on [OpenGameArt](https://opengameart.org). See [music credits](public/music/CREDITS.md).
- Built with [Three.js](https://threejs.org) and [Vite](https://vitejs.dev).
- Photographic surface scans and daylight environment from [Poly Haven](https://polyhaven.com), licensed [CC0](https://polyhaven.com/license). Asset import powered by the [Poly Haven API](https://polyhaven.com/our-api). See [the source manifest](public/realism/sources.json) and [asset credits](public/realism/CREDITS.md).
- Age of Empires is a trademark of Microsoft; this is an unaffiliated fan project with original code and art.

## License

MIT
