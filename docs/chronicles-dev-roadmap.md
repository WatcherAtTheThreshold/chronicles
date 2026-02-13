# Chronicles — Development Roadmap

A build plan for use with Claude Code. The Cruxfade-Micro repo is accessible as a reference for reusable systems, patterns, and art assets.

---

## What We're Building

A narrative-driven card and dice roguelike. No grid. A narrator tells you a story, you play cards to offset hazards, and roll a die to decide your fate. JSON-driven from day one. Same vanilla JS/HTML/CSS stack as Cruxfade-Micro.

**Reference repo**: Cruxfade-Micro (accessible via GitHub)
**New repo**: Chronicles (GitHub Pages hosted)

---

## What to Bring From Cruxfade-Micro

These systems are proven and can be adapted rather than rebuilt from scratch:

**Direct reuse (copy and adapt)**
- `rng.js` — Seeded RNG system, works as-is
- Procedural naming system — for narrator name generation
- JSON data loading pattern — fetch/parse architecture from main.js
- CSS custom properties theme system — adapt color palette for Chronicles

**Pattern reuse (same approach, new implementation)**
- State management architecture (single source of truth in state.js)
- Modular JS structure (main.js, state.js, ui.js)
- Card data structure from cards.json — simplified to three categories
- DOM caching pattern from ui.js

**Art assets (reuse where appropriate)**
- Character portraits — narrator portrait(s)
- Card art and sigils
- Enemy/creature illustrations
- UI frame elements and borders
- Any assets that fit the fantasy starting tone

---

## Phase 0: Project Scaffold (1 session)
*Get the repo set up and the board on screen*

- [ ] Create Chronicles repo on GitHub
- [ ] Set up file structure:
```
chronicles/
  index.html
  css/
    styles.css
  js/
    main.js
    state.js
    ui.js
    rng.js          ← copy from Cruxfade-Micro
    narrator.js     ← new, handles text display and speech
  data/
    story.json      ← narrative nodes
    cards.json      ← card definitions
    config.json     ← run configuration
  assets/
    portraits/
    cards/
    encounters/
    ui/
```
- [ ] Build the board layout in HTML/CSS matching the mockup
  - Left sidebar: narrator portrait, player health/attack, draw pile, take card/redraw buttons
  - Center: narrative panel (large text area with background image support)
  - Bottom tray: 3-card hand, hazard card, 3 context buttons, die
- [ ] Verify layout at target aspect ratio (3:2 or 5:3, horizontal)
- [ ] Copy `rng.js` from Cruxfade-Micro
- [ ] Basic data loader in main.js (same pattern as Cruxfade-Micro)
- [ ] Placeholder content renders in all zones

**Milestone**: The board is on screen, looks like the mockup, loads data files.

---

## Phase 1: Narrative Engine (2-3 sessions)
*Get the story flowing through the narrative panel*

### 1a. Node System
- [ ] Define node schema in story.json (story, hazard, choice, random_pool types)
- [ ] Build node reader in state.js — loads a node by ID, determines type, routes to handler
- [ ] Story nodes: display lines in narrative panel, advance on spacebar/click/continue button
- [ ] Choice nodes: populate the three context buttons with choice labels, route to destination nodes
- [ ] Random pool nodes: weighted RNG selection from pool, route to selected node

### 1b. Text Display
- [ ] narrator.js — handles text rendering in the narrative panel
- [ ] Line-by-line or full-block display (test both, decide which feels better)
- [ ] Spacebar / click / continue button advances to next node
- [ ] Background image loading and fade behind text
- [ ] Text shadow or overlay for readability over varied backgrounds

### 1c. Narrator System
- [ ] Narrator portrait in sidebar with procedural name (adapt Cruxfade naming system)
- [ ] Narrator name displayed once at game start ("A figure shuffles a deck...")
- [ ] Narrator state changes — different expressions or portrait variants based on game state
  - Calm (story beats)
  - Alert (hazard approaching)
  - Concerned (low player health)
  - Unsettled (cosmic horror zone)

### 1d. Optional — Text-to-Speech
- [ ] Web Speech API integration as toggle
- [ ] Speech plays on node display, continue button activates when speech finishes
- [ ] Graceful fallback if API unavailable

**Milestone**: You can tap through a sequence of story nodes, see text appear with background art, and hit branching choices that route to different paths.

---

## Phase 2: Card System (2-3 sessions)
*Get cards in hand and playable*

### 2a. Card Data
- [ ] Define card schema in cards.json:
  - `id`, `name`, `category` (melee / hazard_assist / magic), `sigil`, `image`
  - `effect` — what it does mechanically (attack boost, roll modifier, heal, etc.)
  - `value` — magnitude of the effect
  - `description` — flavor text
- [ ] Three categories with distinct back sigils
- [ ] Starting deck definition in config.json

### 2b. Hand Management
- [ ] Deal 3 cards face-down at game start, flip to reveal (animation)
- [ ] Display cards in bottom tray with art and sigil
- [ ] Card selection — click to select, click again to confirm play (two-click from Cruxfade)
- [ ] Cards are single-use, removed from hand on play

### 2c. Draw Pile
- [ ] Draw pile displays top card's back sigil (category hint)
- [ ] "Draw New Card" — flip top card face-up to preview
- [ ] "Redraw" — shuffle previewed card back, flip new top card (once per turn)
- [ ] "Take Card" — add previewed card to hand
  - If hand full, choose which card to discard first

**Milestone**: Cards are in hand, can be drawn/redrawn from pile, and can be selected for play. Hand management feels smooth.

---

## Phase 3: Die & Resolution (2-3 sessions)
*Make the die roll matter*

### 3a. Die Display & Interaction
- [ ] Clickable die in bottom-right corner
- [ ] Roll animation (tumbling numbers or face rotation)
- [ ] Result displays clearly after roll
- [ ] Seeded RNG drives the roll (reproducible with seed)

### 3b. Hazard Resolution
- [ ] Hazard nodes present: difficulty number, damage on failure, relevant card categories
- [ ] Resolution flow:
  1. Hazard appears — context buttons become "Play Card / Roll Die / Flee"
  2. If "Play Card" — select a card from hand, apply its modifier
  3. "Roll Die" — roll against difficulty (modified by card if played)
  4. Roll ≥ difficulty → success node
  5. Roll < difficulty → failure node (take damage)
- [ ] Flee option — routes to retreat node, may have its own cost
- [ ] Card relevance check — matching category cards give full bonus, non-matching give reduced or no bonus

### 3c. Damage & Health
- [ ] Damage applied to player health on failure
- [ ] Health bar updates in sidebar
- [ ] Health reaches 0 → game over state
- [ ] Visual/audio feedback on damage (screen shake, red flash, narrator reacts)

**Milestone**: Complete encounter loop works — hazard appears, you optionally play a card, roll the die, succeed or fail, health updates, story continues.

---

## Phase 4: Game Loop & Progression (2-3 sessions)
*Make it a full run*

### 4a. Zone Structure
- [ ] Define zones in config.json:
  - Zone name, theme, background set, encounter pool, anchor events, zone boss
- [ ] Zone 1: Fantasy (forest/stone/steel)
- [ ] Zone 2: Future Fantasy (cracks appear, technology bleeds through)
- [ ] Zone 3: Cosmic Horror (reality frays)
- [ ] Each zone has: random encounter pool + fixed anchor story beats

### 4b. Run Flow
- [ ] Game start → narrator introduction (procedural name, opening narration)
- [ ] Zone 1 encounters drawn from weighted pool, anchors appear at set points
- [ ] Zone transition — narrative beat marks the shift, new pool loads
- [ ] Zone boss / climactic encounter at zone end
- [ ] Victory state after final zone boss

### 4c. Card Economy Across a Run
- [ ] Cards earned from successful encounters or as loot choices
- [ ] Card scarcity tuning — how many cards enter the pool per zone
- [ ] Balance: enough cards to feel agency, few enough to feel scarcity

### 4d. Game Over & Restart
- [ ] Death screen with run stats (distance reached, cards played, narrator name)
- [ ] Seed display for sharing
- [ ] Restart option

**Milestone**: A complete run from start to death or victory. Multiple zones, escalating tone, full card and die economy.

---

## Phase 5: Polish & Feel (Ongoing)
*Make it feel finished*

- [ ] Narrator portrait state transitions (calm → alert → unsettled)
- [ ] Card flip animations
- [ ] Die roll animation polish
- [ ] Screen transitions between zones
- [ ] Sound effects (optional, toggle)
- [ ] Text-to-speech refinement
- [ ] Mobile touch optimization
- [ ] Art replacement — swap placeholders for hand-drawn assets
- [ ] Accessibility pass — font sizes, contrast, screen reader support
- [ ] Save system (LocalStorage for mid-run saves)

---

## Session Workflow Reminders

These carry over from Cruxfade-Micro development practices:

- **Discuss before coding** — concept first, code second
- **Step-by-step with approval** — no writing multiple files without go-ahead
- **Well-commented code** — clear section markers, functions no more than 3 layers deep
- **Backup every 2 hours** — commit and push regularly
- **End-of-session summary** — what changed, which files modified, what's next

---

## File Quick Reference

| File | Purpose |
|------|---------|
| `index.html` | Board layout, single page |
| `css/styles.css` | All styling, CSS custom properties for theming |
| `js/main.js` | Init, data loading, game loop |
| `js/state.js` | Game state, node processing, resolution logic |
| `js/ui.js` | DOM manipulation, rendering, event handling |
| `js/rng.js` | Seeded RNG (from Cruxfade-Micro) |
| `js/narrator.js` | Text display, speech API, narrator state |
| `data/story.json` | All narrative nodes |
| `data/cards.json` | Card definitions and deck compositions |
| `data/config.json` | Run config, zone definitions, tuning values |
