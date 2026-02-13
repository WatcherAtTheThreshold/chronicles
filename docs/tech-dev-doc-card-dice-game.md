# Card & Dice Game — Design Document

A narrative-driven roguelike where story is told through poetic text, decisions are made with cards, and fate is decided by the roll of a die. No grid. No map. Just a table with your hand, your die, and a voice telling you what happens next.

---

## Core Philosophy

Every mechanic must justify its seat at the table. This game exists because Cruxfade-Micro taught us what happens when systems compete for attention — a magic stat that does nothing, two card decks pulling in different directions, complexity that buries the fun. This is the clean version. One deck. One die. One story.

---

## The Board

The interface is a single screen with clearly defined zones:

**Left Sidebar — Character State**
- Character portrait
- Health (numeric + bar)
- Attack (numeric + bar)
- Draw pile with category sigil visible on top card
- Take Card / Redraw buttons

**Center — Narrative Panel**
- Large text area dominating the screen
- Poetic, line-broken narrative text overlaying scene illustrations
- Background images fade behind text for atmosphere without competing for readability
- Text appears on player input (spacebar or continue tap)

**Bottom Tray — Player Tools**
- Three card hand (face up during play)
- Hazard/encounter card showing current threat
- Three context-sensitive action buttons
- The die

---

## Core Loop

```
Narrative presents a situation
    ↓
Player reads, absorbs, presses continue
    ↓
Encounter or choice appears
    ↓
Player decides: play a card or face it raw
    ↓
Roll the die
    ↓
Outcome resolves → feeds into next narrative beat
```

The rhythm is: **story → agency → fate → consequence → story**

---

## Card System

### Three Categories

**Melee (Attack/Defense)**
- Direct combat application
- Temporary attack boost or damage reduction
- Sigil: crossed blades or similar

**Hazard Assist**
- Environmental and situational problem-solving
- Boosts die roll or offsets hazard difficulty
- Sigil: the eye symbol

**Magic (Attack/Heal/Defense)**
- Same mechanical effects as melee but flavored as magical
- Heals go to HP, attack boosts go to attack stat, defense reduces incoming damage
- No separate magic stat — magic just does things to existing stats, magically
- Sigil: the starburst symbol

### Hand Management

- Player holds **3 cards** at a time
- All cards are **single use** — played and discarded
- At game start, hand is dealt face down, then flipped to reveal
- Card backs show a **category sigil** so the draw pile gives partial information

### Draw Pile

- **Draw New Card**: flip the top card of the pile to see it
- **Redraw**: once per turn, shuffle that card back and flip a new one
- **Take Card**: add the revealed card to your hand (replacing a card if hand is full, or filling an empty slot after using one)

The decision: you can see the category sigil on the back, you flip it, and then decide — take it or redraw once for something else. Partial information creates meaningful choices.

---

## The Die

The die is a **physical, interactive element** on screen. The player clicks/taps to roll it. This is not a behind-the-scenes calculation — the act of rolling is part of the experience.

### Resolution Mechanic

Each hazard has a **difficulty number**. The player rolls against it.

- **Roll ≥ difficulty**: success
- **Roll < difficulty**: failure, take consequences (usually damage)

### Card Interaction with the Die

Playing a relevant card before rolling modifies the check:
- A matching card might **add to the roll** (+2, +3, etc.)
- Or **reduce the difficulty** (hazard becomes easier)
- Or in some cases **bypass the roll entirely** (perfect card for the situation)

The space between "guaranteed safety with the right card" and "the card just improves your odds" is where all the tension lives. Most cards should improve odds, not guarantee success.

---

## Stats

Only two stats. That's it.

**Health** — How much damage you can take before the run ends. Depleted by failed hazard rolls, enemy attacks, and story consequences.

**Attack** — Your offensive capability. Modified temporarily by melee and magic cards. Determines damage dealt in combat encounters.

No magic stat. No defense stat. No experience. No levels. Cards and the die handle everything else.

---

## Narrative System

### Presentation

Story is delivered as **short, poetic text** — typically three lines, centered in the narrative panel, broken for rhythm:

```
As you reach the top of the stairwell
the stairs disintegrate
and crumble away before you.
```

The text is large, readable, and deliberate. It's a voice telling you a story, not a wall of exposition.

### Pacing

- All narrative advances on **player input** (spacebar / tap / continue button)
- No auto-advance timers — the player controls the rhythm
- Some beats are one line. Some are three. The variation IS the pacing.
- Optional: Web Speech API for text-to-speech narration (toggle on/off, not a dependency)

### Context Buttons

Three buttons in the bottom tray change meaning based on the current node:

During **story beats**: Continue / Look Around / Rest
During **hazard encounters**: Play Card / Roll Die / Flee
During **choice moments**: Option A / Option B / Option C

Same three buttons, different labels. The interface stays stable while the game state shifts underneath.

---

## Data Architecture

Everything is JSON-driven from the start. The story IS the data.

### Node Types

**story** — Narrative text, advances to next node
```json
{
  "id": "tower_stairs_01",
  "type": "story",
  "lines": ["The tower spirals upward", "into a darkness that breathes", "and whispers your name."],
  "background": "tower_interior_01",
  "next": "tower_stairs_02"
}
```

**hazard** — Presents a threat, cards and die come into play
```json
{
  "id": "tower_hazard_01",
  "type": "hazard",
  "lines": ["Something blocks your path.", "It pulses with a dim red light.", "It does not move. It waits."],
  "background": "mushroom_creature_01",
  "hazard": {
    "name": "Glow Stalker",
    "image": "mushroom_creature_01",
    "difficulty": 4,
    "damage": 8,
    "relevantCards": ["hazard_assist", "melee_attack"]
  },
  "buttons": [
    { "label": "Play Card", "action": "play_card" },
    { "label": "Roll Die", "action": "roll_only" },
    { "label": "Flee", "action": "flee", "next": "tower_retreat_01" }
  ],
  "outcomes": {
    "success": "tower_landing_01",
    "failure": "tower_fall_01"
  }
}
```

**choice** — Player picks from branching options
```json
{
  "id": "tower_landing_01",
  "type": "choice",
  "lines": ["Two doorways yawn open before you.", "One glows faintly. One does not."],
  "buttons": [
    { "label": "Glowing Door", "next": "tower_light_path_01" },
    { "label": "Dark Door", "next": "tower_dark_path_01" },
    { "label": "Search Room", "next": "tower_search_01" }
  ]
}
```

**random_pool** — Weighted RNG encounter selection for replayability
```json
{
  "id": "forest_random_pool",
  "type": "random_pool",
  "pool": [
    { "nodeId": "forest_wolves_01", "weight": 3 },
    { "nodeId": "forest_shrine_01", "weight": 2 },
    { "nodeId": "forest_merchant_01", "weight": 1 },
    { "nodeId": "forest_trap_01", "weight": 3 },
    { "nodeId": "forest_rest_spot_01", "weight": 1 }
  ]
}
```

### Universal Node Fields

Every node has: `id`, `type`, `lines`, `background`. The narrative panel always knows what to display regardless of node type. Each type then adds its own specific fields.

---

## Progression & Replayability

### Chapter/Zone Structure

The game is divided into zones, each with:
- A pool of random encounters (drawn via weighted RNG)
- Anchor story beats that always appear (key plot moments)
- A zone boss or climactic encounter

The skeleton of the story stays consistent but the encounters between anchors change every run.

### Setting Arc

The tonal journey across zones:
1. **Fantasy** — Familiar, grounded, earthy. Forests and stone and steel.
2. **Future Fantasy** — Cracks appear. Technology bleeds through. The world isn't what it seemed.
3. **Cosmic Horror** — The big bad is something that shouldn't exist. Reality frays.

Art, writing tone, and encounter design all evolve across this arc. Early encounters are wolves and traps. Late encounters are things without names.

---

## Fail State

Health reaches zero → run ends. Simple and clear.

Cards are the player's primary agency for avoiding this. Good card management extends the run. Bad luck or poor choices chip away at health until there's nothing left.

---

## Technical Foundation

- **Vanilla JavaScript, HTML, CSS** — same stack as Cruxfade-Micro
- **JSON-driven data** — all story, encounters, and card definitions in data files
- **Seeded RNG** — reproducible runs, shareable seeds (reuse from Cruxfade-Micro)
- **ES modules** for code organization
- **GitHub Pages** for hosting
- **Web Speech API** — optional text-to-speech narration (toggle)

---

## What This Game Is Not

- Not a grid game. No spatial movement.
- Not a deck builder. You don't construct a deck — you manage a small hand dealt by fate.
- Not a visual novel. The text is spare and poetic, not verbose.
- Not a numbers game. Two stats, simple rolls, no spreadsheet optimization.

It's a table. Your cards. Your die. And someone telling you a story.
