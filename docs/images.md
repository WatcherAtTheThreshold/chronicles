# Chronicles — Image Asset Plan

## Overview

All image files live in `assets/` organized by folder. Files are `.png` (transparency support) or `.webp` (smaller size, wide browser support). The game loads them dynamically via JavaScript — no build step required.

---

## File Structure & Naming Convention

```
assets/
├── encounters/      Scene backgrounds (narrative panel + hazard viewport)
├── portraits/       Narrator portrait states
├── cards/           Card face illustrations (optional)
├── ui/
│   ├── sigils/      Category sigil icons
│   └── die/         Die face images (stretch goal)
```

Each file is named by its **key** (listed below). The key maps 1:1 to the filename:
`forest_entrance_01` → `assets/encounters/forest_entrance_01.png`

---

## Dimensions Reference

All dimensions from CSS custom properties and computed styles:

| Element | Size | Aspect | Notes |
|---------|------|--------|-------|
| Narrative background | 1280×720+ | 16:9 | `background-size: cover`, rendered at 0.3 opacity |
| Hazard viewport | 170×225 | ~3:4 | Same image as narrative bg, rendered at 0.6 opacity |
| Narrator portrait | ~170×230 | 3:4 | Full sidebar width, `aspect-ratio: 3/4` |
| Card face | 140×225 | ~5:8 | `--card-width` × `--card-height` |
| Card sigil (draw) | 50×50 | 1:1 | Circular, border-radius 50% |
| Card sigil (hand) | 28×28 | 1:1 | Circular, border-radius 50% |
| Die face | 100×100 | 1:1 | Currently text, image optional |

---

## Tier 1 — Encounter Backgrounds (build first)

These are the highest-impact assets. They fill the narrative panel (subtle, 0.3 opacity) and the hazard viewport (prominent, 0.6 opacity). Without them the game feels empty.

**Recommended size**: 1280×720 or larger. Dark, atmospheric, painterly. They sit behind white text so keep the top half relatively dark.

### Zone 0 — Narrator Intro

| Key | Scene | Mood | Notes |
|-----|-------|------|-------|
| `narrator_table` | A figure at a table, cards and die | Intimate, warm | The opening image. Firelight, close framing |

### Zone 1 — The Old Wood (Fantasy)

| Key | Scene | Mood | Notes |
|-----|-------|------|-------|
| `open_field_01` | Tall grass, dusty road ahead | Calm, open | First outdoor scene |
| `forest_entrance_01` | Treeline, path disappearing into shadow | Threshold, anticipation | Transition from field to forest |
| `forest_interior_01` | Dense canopy, filtered light | Enclosed, natural | Used for multiple forest encounters |
| `forest_fork_01` | Path splits two ways | Choice, uncertainty | Choice node visual |
| `forest_clearing_01` | Open space in the trees, sunlight | Brief respite | Rest/safe moments |
| `forest_mist_01` | Fog rolling between trunks | Mysterious, obscured | Low visibility encounters |
| `forest_rest_01` | Sheltered spot, fallen log | Safe, quiet | Heal nodes |
| `forest_stream_01` | Water cutting through mossy stone | Peaceful, grounding | Stream/brook area |
| `brook_01` | Brook with muddy bank | Discovery | Brook discovery scenes |
| `brook_clearing_01` | Clearing by the brook | Open, natural | Post-brook scenes |
| `ravine_01` | Deep crack in earth, roots hanging | Dangerous, vertical | Ravine hazard |
| `wolves_01` | Eyes in the dark, low shapes | Predatory, tense | Wolf encounter |
| `boar_01` | Tusked beast, churned earth | Aggressive, grounded | Boar hazard |
| `shrine_01` | Stone altar, moss and offerings | Sacred, ancient | Shrine discovery/choice |
| `stranger_camp_01` | Lone campfire, a figure sitting | Ambiguous, wary | Stranger encounter |
| `forest_guardian_01` | Massive shape among the trees | Boss, imposing | Zone 1 boss |
| `forest_trap_01` | Snare or pitfall, disturbed ground | Hidden danger | Trap hazard |
| `ridge_view_01` | High ground, vista below | Exposure, distance | Ridge encounters |
| `ridge_slide_01` | Loose rock, steep descent | Unstable, kinetic | Ridge hazard |
| `ruins_interior_01` | Crumbled stone walls, cellar | Decayed shelter | Interior discovery |

### Zone 2 — The Fractured Reach (Future Fantasy)

| Key | Scene | Mood | Notes |
|-----|-------|------|-------|
| `zone_transition_01` | Reality seam, sky cracking | Awe, unease | Z1→Z2 transition moment |
| `fractured_sky_01` | Broken sky, tech visible through cracks | Disorienting | Zone 2 default atmosphere |
| `metal_ruins_01` | Corroded structures, overgrown circuits | Abandoned tech | Multiple Zone 2 encounters |
| `foundry_01` | Molten light, industrial machinery | Heat, danger | Foundry hazard |
| `glass_forest_01` | Crystalline trees, refracted light | Alien beauty | Glass forest encounter |
| `signal_tower_01` | Antenna spire, pulsing light | Technology, signal | Signal tower discovery |
| `static_field_01` | Air shimmering with interference | Distortion | Static field hazard |
| `warden_domain_01` | Fortress of merged tech and stone | Boss, imposing | Zone 2 boss arena |
| `ruins_01` | Exterior ruins, fractured landscape | Desolation | General Zone 2 ruins |
| `bridge_light_01` | Bridge made of hard light | Fragile, luminous | Bridge hazard |
| `echo_chamber_01` | Hollow space, sound made visible | Temporal | Echo/memory encounters |

### Zone 3 — The Unraveling (Cosmic Horror)

| Key | Scene | Mood | Notes |
|-----|-------|------|-------|
| `void_01` | Empty space, distant shapes | Absence, dread | General void scene |
| `void_02` | Ground that breathes | Wrong, organic | Reality failing |
| `void_03` | Sky with teeth | Hostile, surreal | Looking up is a mistake |
| `void_04` | Distance doesn't work | Warped perspective | Spatial horror |
| `void_05` | Static and starlight | Between things | Liminal void |
| `void_06` | Thread of coherent reality | Last thread | Near the end |
| `boss_void` | The thing at the end | Final boss, cosmic | The Unnamed's domain |

**Total: 40 encounter backgrounds**

---

## Tier 2 — Narrator Portrait (build second)

The narrator sits in the top-left sidebar. Currently a text placeholder ("Portrait"). The portrait should be a single character — a mysterious figure who tells the story.

**Recommended size**: 340×460 (2x for retina at 170×230 render size). Dark, painterly. The frame has an 8px border radius.

### Basic (1 image)

| Key | File | Notes |
|-----|------|-------|
| `narrator_default` | `assets/portraits/narrator_default.png` | The narrator at rest. This alone replaces the placeholder |

### Mood States (4 images)

| Key | File | Mood | Expression | When |
|-----|------|------|------------|------|
| `narrator_calm` | `assets/portraits/narrator_calm.png` | Calm | Relaxed, slight smile, eyes steady | Zone 0–1, no hazard, health > 30% |
| `narrator_alert` | `assets/portraits/narrator_alert.png` | Alert | Eyes widened, leaning forward slightly | Active hazard in Zone 0–1 |
| `narrator_concerned` | `assets/portraits/narrator_concerned.png` | Concerned | Brow furrowed, lips tight, looking aside | Health < 30% or Zone 1 baseline |
| `narrator_unsettled` | `assets/portraits/narrator_unsettled.png` | Unsettled | Eyes hollow, edges blurring, cracks in expression | Zone 2+ (The Unraveling). Reality affecting the narrator |

### Stretch Goal — Animated Mood Transitions (3 frames per mood)

If you want smooth transitions between moods, each state could have 3 frames that play in sequence (e.g., 150ms per frame = 450ms transition). The game would step through frames 1→2→3 when entering a mood, and 3→2→1 when leaving.

| Key Pattern | Files | Notes |
|-------------|-------|-------|
| `narrator_{mood}_1` | Frame 1 — entering the mood | Subtle shift from neutral |
| `narrator_{mood}_2` | Frame 2 — mid-transition | Between states |
| `narrator_{mood}_3` | Frame 3 — full expression | Holds here until mood changes |

Example: `narrator_alert_1.png`, `narrator_alert_2.png`, `narrator_alert_3.png`

**Frame count**: 4 moods × 3 frames = 12 portrait images
**Without animation**: 4 moods × 1 image = 4 portrait images
**Minimum viable**: 1 default image

---

## Tier 3 — Card Art (optional)

Cards currently render as text-only with colored sigil circles. Card art would replace or sit behind the text info on the card front.

**Recommended size**: 280×450 (2x for retina). Each card already has an `"image"` key in cards.json that maps to the filename.

### Card Image Keys (24 cards)

**Melee (crossed_blades):**

| Key | Card Name | Effect | Notes |
|-----|-----------|--------|-------|
| `melee_strike` | Strike | +2 roll | Swift blow, blade in motion |
| `melee_guard` | Guard | -4 damage | Braced stance, shield/arms up |
| `melee_bash` | Bash | -2 DC | Force through, heavy impact |
| `melee_cleave` | Cleave | +3 roll | Wide swing, arc of steel |
| `melee_parry` | Parry | -6 damage | Deflecting blade, precise angle |
| `melee_reckless` | Reckless Swing | +4 roll | Wild overhead, all-in |
| `melee_overload` | Overload | +4 roll | Fractured energy through blade (Zone 2 tech) |
| `melee_last_stand` | Last Stand | +5 roll | Final effort, everything left (Zone 3 cosmic) |

**Hazard Assist (eye):**

| Key | Card Name | Effect | Notes |
|-----|-----------|--------|-------|
| `hazard_keen_eye` | Keen Eye | +2 roll | Focused gaze, clarity |
| `hazard_steady_hand` | Steady Hand | -2 DC | Calm under pressure |
| `hazard_quick_step` | Quick Step | -5 damage | Dodge, blur of motion |
| `hazard_sharp_instinct` | Sharp Instinct | +3 roll | Gut feeling, awareness |
| `hazard_iron_nerve` | Iron Nerve | Bypass | Walking through unflinching |
| `hazard_second_look` | Second Look | Reroll | Double-take, second chance |
| `hazard_scan` | Scan | -3 DC | Tech overlay, data readout (Zone 2) |
| `hazard_glimpse` | Glimpse | Bypass | Seeing through reality (Zone 3) |

**Magic (starburst):**

| Key | Card Name | Effect | Notes |
|-----|-----------|--------|-------|
| `magic_spark` | Spark | +2 roll | Small flash of arcane force |
| `magic_mend` | Mend | Heal 6 | Wound closing, warm light |
| `magic_ward` | Ward | -5 damage | Shimmer barrier, protective |
| `magic_shatter` | Shatter | -3 DC | Obstacle cracking apart |
| `magic_restore` | Restore | Heal 10 | Deep magic, full restoration |
| `magic_veil` | Veil | Bypass | Invisibility, never there |
| `magic_surge` | Surge | +3 roll | Raw power, crackling energy (Zone 2) |
| `magic_unravel` | Unravel | -4 DC | Reality threads pulled apart (Zone 3) |

**File path**: `assets/cards/{key}.png` (e.g., `assets/cards/melee_strike.png`)

---

## Tier 4 — UI Elements (optional polish)

### Sigil Icons

Replace the colored CSS circles with actual icon art. SVG recommended for crispness at small sizes.

| Key | File | Category | Description |
|-----|------|----------|-------------|
| `sigil_crossed_blades` | `assets/ui/sigils/sigil_crossed_blades.svg` | Melee | Two blades crossed |
| `sigil_eye` | `assets/ui/sigils/sigil_eye.svg` | Hazard Assist | Open eye, awareness |
| `sigil_starburst` | `assets/ui/sigils/sigil_starburst.svg` | Magic | Radiating star/spark |

### Card Back Pattern

| Key | File | Notes |
|-----|------|-------|
| `card_back` | `assets/ui/card_back.png` | Ornate pattern for face-down cards. 140×225 or 2x |

---

## Stretch Goal — Animated Die Faces

Currently the die is text-only (shows "?" or "1–6" in 2.8rem monospace). An illustrated die would replace the text with face images.

**Recommended size**: 200×200 (2x for retina at 100×100 render size).

### Static Faces (6 images)

| Key | File | Notes |
|-----|------|-------|
| `die_face_1` | `assets/ui/die/die_face_1.png` | One pip/mark |
| `die_face_2` | `assets/ui/die/die_face_2.png` | Two pips |
| `die_face_3` | `assets/ui/die/die_face_3.png` | Three pips |
| `die_face_4` | `assets/ui/die/die_face_4.png` | Four pips |
| `die_face_5` | `assets/ui/die/die_face_5.png` | Five pips |
| `die_face_6` | `assets/ui/die/die_face_6.png` | Six pips |

### Animated Roll (stretch within the stretch)

Instead of cycling numbers during the 800ms roll, cycle through a sprite sheet or a set of tumbling frames:

| Key | File | Notes |
|-----|------|-------|
| `die_roll_strip` | `assets/ui/die/die_roll_strip.png` | Horizontal sprite strip, 8–12 frames of a tumbling die |

**Frame math**: 800ms roll ÷ 80ms per frame = 10 frames. Strip would be 10 × 200px = 2000×200.

Alternatively, individual frame files:

| Key Pattern | Notes |
|-------------|-------|
| `die_roll_01` through `die_roll_10` | Individual tumbling frames at 200×200 each |

---

## Color Reference (for art direction)

From CSS `:root` variables — keep art within this palette:

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0f0f13` | Very dark navy, the void |
| Text | `#e8e6e3` | Off-white, paper tone |
| Accent | `#6ea7ff` | Bright blue, magic, links |
| Good | `#68d391` | Green, success, heal |
| Bad | `#ef6b73` | Red, damage, failure |
| Warning | `#f6d55c` | Gold, interactive hints |
| Melee | `#c24d3f` | Rust/copper |
| Hazard Assist | `#3a845a` | Dark green |
| Magic | `#6ea7ff` | Bright blue (same as accent) |
| Surface | `#141926` | Dark blue-gray panels |
| Border | `#263047` | Subtle panel edges |

**Art style note**: Images render at low opacity (0.3 narrative, 0.6 hazard viewport) over dark backgrounds. High-contrast, painterly styles with dark edges work best. Avoid busy detail that muddies at low opacity.

---

## Checklist

### Tier 1 — Encounter Backgrounds (40 images)
**Zone 0 — Intro**
- [ ] `narrator_table.png`

**Zone 1 — The Old Wood (20 images)**
- [ ] `open_field_01.png`
- [ ] `forest_entrance_01.png`
- [ ] `forest_interior_01.png`
- [ ] `forest_fork_01.png`
- [ ] `forest_clearing_01.png`
- [ ] `forest_mist_01.png`
- [ ] `forest_rest_01.png`
- [ ] `forest_stream_01.png`
- [ ] `brook_01.png`
- [ ] `brook_clearing_01.png`
- [ ] `ravine_01.png`
- [ ] `wolves_01.png`
- [ ] `boar_01.png`
- [ ] `shrine_01.png`
- [ ] `stranger_camp_01.png`
- [ ] `forest_guardian_01.png`
- [ ] `forest_trap_01.png`
- [ ] `ridge_view_01.png`
- [ ] `ridge_slide_01.png`
- [ ] `ruins_interior_01.png`

**Zone 2 — The Fractured Reach (11 images)**
- [ ] `zone_transition_01.png`
- [ ] `fractured_sky_01.png`
- [ ] `metal_ruins_01.png`
- [ ] `foundry_01.png`
- [ ] `glass_forest_01.png`
- [ ] `signal_tower_01.png`
- [ ] `static_field_01.png`
- [ ] `warden_domain_01.png`
- [ ] `ruins_01.png`
- [ ] `bridge_light_01.png`
- [ ] `echo_chamber_01.png`

**Zone 3 — The Unraveling (8 images)**
- [ ] `void_01.png`
- [ ] `void_02.png`
- [ ] `void_03.png`
- [ ] `void_04.png`
- [ ] `void_05.png`
- [ ] `void_06.png`
- [ ] `boss_void.png`

### Tier 2 — Narrator Portrait
- [ ] `narrator_default.png` (minimum viable)
- [ ] `narrator_calm.png`
- [ ] `narrator_alert.png`
- [ ] `narrator_concerned.png`
- [ ] `narrator_unsettled.png`

### Tier 3 — Card Art (24 images)
- [ ] `melee_strike.png` through `melee_last_stand.png` (8 melee)
- [ ] `hazard_keen_eye.png` through `hazard_glimpse.png` (8 hazard)
- [ ] `magic_spark.png` through `magic_unravel.png` (8 magic)

### Tier 4 — UI
- [ ] `sigil_crossed_blades.svg`
- [ ] `sigil_eye.svg`
- [ ] `sigil_starburst.svg`
- [ ] `card_back.png`

### Stretch — Die
- [ ] `die_face_1.png` through `die_face_6.png` (6 faces)
- [ ] `die_roll_strip.png` or `die_roll_01.png` through `die_roll_10.png` (animated)

### Stretch — Animated Narrator (12 frames)
- [ ] `narrator_calm_1.png` through `narrator_calm_3.png`
- [ ] `narrator_alert_1.png` through `narrator_alert_3.png`
- [ ] `narrator_concerned_1.png` through `narrator_concerned_3.png`
- [ ] `narrator_unsettled_1.png` through `narrator_unsettled_3.png`
