# Chronicles — Audio Plan

## Overview

All audio files live in `assets/audio/` organized by folder. Files are `.mp3`.
The game loads them via an audio manager (to be built in `js/audio.js`).
A master volume toggle and mute button will live in the UI.

---

## File Naming Convention

```
assets/audio/
├── ui/              UI clicks and feedback
├── cards/           Card interactions
├── die/             Die roll and landing
├── hazard/          Hazard lifecycle
├── events/          Damage, heal, zone transitions, game over
├── ambience/        Zone background loops
└── music/           Zone music loops (optional, separate from ambience)
```

Each file is named by its **key** (listed below). The key maps 1:1 to the filename:
`ui_button_click` → `assets/audio/ui/ui_button_click.mp3`

---

## Tier 1 — Essential (build these first)

These are the sounds that make the game feel alive. Without them, the game feels silent at its most important moments.

| Key | Folder | Trigger | Sync | Notes |
|-----|--------|---------|------|-------|
| `die_roll` | die/ | Die clicked, rolling phase starts | 800ms loop, fade out at end | Tumbling/rattling loop |
| `die_land` | die/ | Roll animation ends, result shown | Plays at 800ms mark | Short impact thud |
| `hazard_success` | hazard/ | Hazard resolved, player wins | Sync with green flash (600ms) | Bright chime or rising tone |
| `hazard_failure` | hazard/ | Hazard resolved, player loses | Sync with red flash (600ms) | Low thud or dissonant hit |
| `damage_hit` | events/ | Player takes damage | Sync with screen shake (300ms) | Impact + pain cue |
| `card_flip` | cards/ | Face-down card clicked to reveal | Sync with 3D flip (400ms) | Paper flip whoosh |
| `card_play` | cards/ | Face-up card played against hazard | Instant on click | Card snap/place sound |
| `game_over_death` | events/ | HP reaches 0 | On game over screen render | Somber final note (1-2s) |
| `game_over_victory` | events/ | Final boss defeated, victory screen | On victory screen render | Triumphant chord (2-3s) |

---

## Tier 2 — Important (build second)

These add texture to the core loop. The game works without them but feels hollow.

| Key | Folder | Trigger | Sync | Notes |
|-----|--------|---------|------|-------|
| `ui_button_click` | ui/ | Any context button or draw button clicked | Instant | Soft, clean click |
| `card_draw` | cards/ | Card taken from draw pile to hand | Instant on Take Card click | Slide/draw sound |
| `card_redraw` | cards/ | Redraw button clicked | Instant | Discard shuffle + new draw |
| `card_reveal` | cards/ | Draw pile card clicked to reveal | Instant | Quick flip/peek sound |
| `hazard_start` | hazard/ | Entering a hazard node | On hazard frame activation | Tension rise sting (0.5-1s) |
| `discovery_pick` | cards/ | Discovery card selected | Instant | Acquire/collect chime |
| `heal` | events/ | Health restored (node heal, card heal, discovery) | Instant | Warm shimmer tone |
| `flee` | events/ | Flee button clicked | Instant | Quick whoosh/escape sound |
| `zone_transition` | events/ | Entering z2_start_01 or z3_start_01 | Sync with background fade (800ms) | Reality-tear sting |

---

## Tier 3 — Polish (nice to have)

These are the details that make a game feel finished. Add after Tier 1 and 2 are working.

| Key | Folder | Trigger | Sync | Notes |
|-----|--------|---------|------|-------|
| `narrative_line` | ui/ | Each narrative line fades in | Sync with 300ms stagger | Very subtle text tick (optional, can be annoying) |
| `card_hover` | cards/ | Mouse enters a face-up hand card | On mouseenter | Extremely soft whisper |
| `ui_copy` | ui/ | Seed copied to clipboard | Instant | Tiny confirmation blip |
| `hazard_bypass` | hazard/ | Bypass card auto-wins hazard | Instant | Magical dismissal whoosh |
| `card_play_melee` | cards/ | Melee card played (override card_play) | Instant | Metallic blade sound |
| `card_play_hazard` | cards/ | Hazard assist card played | Instant | Perception/insight tone |
| `card_play_magic` | cards/ | Magic card played | Instant | Arcane shimmer |

---

## Ambience — Zone Background Loops

These loop continuously while the player is in a zone. Crossfade on zone transition.

| Key | Folder | Zone | Mood | Notes |
|-----|--------|------|------|-------|
| `amb_zone0_intro` | ambience/ | Zone 0 (Narrator intro) | Calm, intimate | Quiet room tone, maybe fire crackle. Plays during intro_01–intro_03 only |
| `amb_zone1` | ambience/ | Zone 1 (The Old Wood) | Forest, grounded | Birds, wind, distant water. Warm and natural |
| `amb_zone2` | ambience/ | Zone 2 (The Fractured Reach) | Glitchy, uneasy | Electronic hum, distant static, wind through metal. Organic→synthetic |
| `amb_zone3` | ambience/ | Zone 3 (The Unraveling) | Cosmic horror, hostile | Low drone, reversed sounds, breathing void. Deeply unsettling |

---

## Music — Zone Themes (Optional)

If you want music, it layers on top of ambience. Keep it minimal so it doesn't compete with SFX.

| Key | Folder | Zone | Notes |
|-----|--------|------|-------|
| `mus_zone1` | music/ | Zone 1 | Folk/acoustic, simple melody. Plays under ambience |
| `mus_zone2` | music/ | Zone 2 | Electronic + orchestral blend. Tension builds |
| `mus_zone3` | music/ | Zone 3 | Atonal, sparse, unsettling. More absence than music |
| `mus_boss` | music/ | Any boss fight | Heightened version of current zone theme, or unique boss track |

---

## Timing Reference

These config values determine how long animations run. Audio must sync to these:

```
cardFlipDuration:    400ms   (card 3D rotation)
dieRollDuration:     800ms   (number cycling, then 200ms landing bounce)
narrativeLineDelay:  300ms   (stagger between lines)
damageFlash:         400ms   (health bar red pulse)
screenShake:         300ms   (board jitter on damage)
hazardResultFlash:   600ms   (green/red glow on hazard viewport)
backgroundFade:      800ms   (narrative panel background transition)
```

---

## Implementation Notes

### Audio Manager (`js/audio.js`)
- Preload Tier 1 sounds on game init
- Lazy-load Tier 2/3 and ambience on first zone entry
- Expose `playSound(key)`, `playLoop(key)`, `stopLoop(key)`, `setVolume(0-1)`, `mute()`
- Ambience crossfade: fade out old loop over 800ms, fade in new loop (match background transition)
- Die roll: `playLoop('die_roll')` on roll start, `stopLoop('die_roll')` + `playSound('die_land')` at 800ms

### UI Controls
- Mute/unmute toggle button (top-right or near seed display)
- Volume slider (optional, mute toggle is enough for v1)
- Remember mute state in localStorage

### Production Workflow
1. Create placeholder sounds (any short `.mp3` files) with correct filenames
2. Wire up audio.js with the key→file mapping
3. Test all trigger points with placeholders
4. Replace with final audio assets

---

## Checklist

### Tier 1
- [ ] `die_roll.mp3`
- [ ] `die_land.mp3`
- [ ] `hazard_success.mp3`
- [ ] `hazard_failure.mp3`
- [ ] `damage_hit.mp3`
- [ ] `card_flip.mp3`
- [ ] `card_play.mp3`
- [ ] `game_over_death.mp3`
- [ ] `game_over_victory.mp3`

### Tier 2
- [ ] `ui_button_click.mp3`
- [ ] `card_draw.mp3`
- [ ] `card_redraw.mp3`
- [ ] `card_reveal.mp3`
- [ ] `hazard_start.mp3`
- [ ] `discovery_pick.mp3`
- [ ] `heal.mp3`
- [ ] `flee.mp3`
- [ ] `zone_transition.mp3`

### Tier 3
- [ ] `narrative_line.mp3`
- [ ] `card_hover.mp3`
- [ ] `ui_copy.mp3`
- [ ] `hazard_bypass.mp3`
- [ ] `card_play_melee.mp3`
- [ ] `card_play_hazard.mp3`
- [ ] `card_play_magic.mp3`

### Ambience
- [ ] `amb_zone0_intro.mp3`
- [ ] `amb_zone1.mp3`
- [ ] `amb_zone2.mp3`
- [ ] `amb_zone3.mp3`

### Music
- [ ] `mus_zone1.mp3`
- [ ] `mus_zone2.mp3`
- [ ] `mus_zone3.mp3`
- [ ] `mus_boss.mp3`
