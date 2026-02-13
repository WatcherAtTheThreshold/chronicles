# Chronicles — Claude Code Project Guide

## What This Is

A narrative-driven card and dice roguelike. No grid. A narrator tells you a story, you play cards to offset hazards, and roll a die to decide your fate. Vanilla JS/HTML/CSS, JSON-driven, hosted on GitHub Pages.

**Reference repo**: `d:\GitHub\cruxfade-micro` — proven systems to adapt, not rebuild.

---

## Tech Stack

- Vanilla JavaScript (ES6 modules)
- HTML/CSS (single page, CSS custom properties for theming)
- JSON data files for all game content
- No framework, no build step
- GitHub Pages hosting

---

## File Structure

```
chronicles/
  index.html
  css/
    styles.css
  js/
    main.js         — init, data loading, game loop
    state.js        — game state, node processing, resolution logic
    ui.js           — DOM manipulation, rendering, event handling
    rng.js          — seeded RNG (copied from Cruxfade-Micro)
    narrator.js     — text display, speech API, narrator state
  data/
    story.json      — narrative nodes
    cards.json      — card definitions
    config.json     — run configuration, zone definitions, tuning values
  assets/
    portraits/
    cards/
    encounters/
    ui/
  docs/             — design documents, mockups, roadmap
```

---

## Coding Conventions

- **Discuss before coding** — concept first, code second
- **Step-by-step with approval** — no writing multiple files without go-ahead
- **Well-commented code** — clear section markers, functions no more than 3 layers deep
- **Backup every 2 hours** — commit and push regularly
- **End-of-session summary** — what changed, which files modified, what's next

### Patterns (from Cruxfade-Micro)

- **State**: single centralized state object in `state.js`, all mutations through exported functions
- **UI**: cache DOM elements once at startup in a `DOM` object, full re-render on state change via `renderAll()`
- **Data loading**: async fetch with graceful fallback per file (required files throw, optional files warn)
- **RNG**: seeded LCG via `rng.js`, seed from URL param `?seed=`, all randomness flows through it
- **Cards**: two-click interaction (select, then confirm) to prevent accidental plays
- **CSS**: all colors and spacing via CSS custom properties in `:root`

---

## Key Design Rules

- Two stats only: **Health** and **Attack**. No magic stat, no defense stat, no levels.
- One deck, three card categories: **Melee**, **Hazard Assist**, **Magic**
- Hand size: 3 cards, single use, all start face-down (click to flip/reveal)
- Card replenishment is draw pile only — no separate loot system
- Draw pile: top card shows back (sigil = category hint), Take Card to add to hand, Redraw discards top card and reveals next (once per turn)
- The draw pile is finite — every redraw is a card gone forever
- Card discovery nodes: after some successes, 2-3 cards appear face-down (sigils visible), player picks one, it shuffles into the draw pile
- All narrative in short poetic lines (typically 1-3 lines per beat)
- Player controls pacing — no auto-advance timers
- Three context buttons that change labels based on node type (stable interface, shifting state)
- Seeded RNG for reproducible, shareable runs

---

## Node Types

All nodes share: `id`, `type`, `lines[]`, `background`

| Type | Purpose | Extra Fields |
|------|---------|-------------|
| `story` | Narrative text, advances forward | `next` |
| `hazard` | Threat requiring cards/die | `hazard{}`, `buttons[]`, `outcomes{}` |
| `choice` | Branching player decision | `buttons[]` with `next` per option |
| `discovery` | Card reward after success | `offers[]` (card IDs), `count`, `next` |
| `random_pool` | Weighted RNG encounter selection | `pool[]` with `nodeId` and `weight` |

---

## Zone Progression

1. **Fantasy** — forests, stone, steel. Grounded and familiar.
2. **Future Fantasy** — cracks appear, technology bleeds through.
3. **Cosmic Horror** — reality frays, things without names.

Art, writing tone, and encounter design all shift across this arc.

---

## Development Phases

See [docs/chronicles-dev-roadmap.md](docs/chronicles-dev-roadmap.md) for the full roadmap.

0. **Scaffold** — repo, file structure, board layout, data loader
1. **Narrative Engine** — node system, text display, narrator, optional TTS
2. **Card System** — card data, hand management, draw pile
3. **Die & Resolution** — die interaction, hazard resolution, damage/health
4. **Game Loop** — zones, run flow, card economy, game over/restart
5. **Polish** — animations, sound, accessibility, save system
