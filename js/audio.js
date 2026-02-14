// ================================================================
// AUDIO — Sound effects and music for Chronicles
// Preloads sounds, exposes play/loop/stop/mute API
// ================================================================

const SOUNDS = {
    // Tier 1 — Essential
    die_roll:         'assets/audio/die/die_roll.mp3',
    die_land:         'assets/audio/die/die_land.mp3',
    hazard_success:   'assets/audio/hazard/hazard_success.mp3',
    hazard_failure:   'assets/audio/hazard/hazard_failure.mp3',
    damage_hit:       'assets/audio/events/damage_hit.mp3',
    card_flip:        'assets/audio/cards/card_flip.mp3',
    card_play:        'assets/audio/cards/card_play.mp3',
    game_over_death:  'assets/audio/events/game_over_death.mp3',
    game_over_victory:'assets/audio/events/game_over_victory.mp3',

    // Tier 2 — Important
    ui_button_click:  'assets/audio/ui/ui_button_click.mp3',
    card_draw:        'assets/audio/cards/card_draw.mp3',
    card_redraw:      'assets/audio/cards/card_redraw.mp3',
    card_reveal:      'assets/audio/cards/card_reveal.mp3',
    hazard_start:     'assets/audio/hazard/hazard-start.mp3',
    discovery_pick:   'assets/audio/cards/discovery_pick.mp3',
    heal:             'assets/audio/events/heal.mp3',
    flee:             'assets/audio/events/flee.mp3',
    zone_transition:  'assets/audio/events/zone_transition.mp3'
};

const _cache = {};
let _muted = false;
let _volume = 0.6;
let _activeLoops = {};

// --------------------------------
// Init & Preload
// --------------------------------

export function initAudio() {
    // Restore mute state from localStorage
    const saved = localStorage.getItem('chronicles_muted');
    if (saved === 'true') _muted = true;

    // Preload all Tier 1 sounds
    for (const [key, path] of Object.entries(SOUNDS)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        _cache[key] = audio;
    }
}

// --------------------------------
// Playback
// --------------------------------

export function playSound(key) {
    if (_muted) return;
    const src = SOUNDS[key];
    if (!src) return;

    // Create a fresh Audio instance for overlapping plays
    const audio = new Audio(src);
    audio.volume = _volume;
    audio.play().catch(() => {});
}

export function playLoop(key) {
    if (_muted) return;
    stopLoop(key);

    const src = SOUNDS[key];
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = _volume;
    audio.loop = true;
    audio.play().catch(() => {});
    _activeLoops[key] = audio;
}

export function stopLoop(key) {
    if (_activeLoops[key]) {
        _activeLoops[key].pause();
        _activeLoops[key].currentTime = 0;
        delete _activeLoops[key];
    }
}

// --------------------------------
// Volume & Mute
// --------------------------------

export function toggleMute() {
    _muted = !_muted;
    localStorage.setItem('chronicles_muted', _muted);

    // Stop all active loops when muting
    if (_muted) {
        for (const key of Object.keys(_activeLoops)) {
            stopLoop(key);
        }
    }

    return _muted;
}

export function isMuted() {
    return _muted;
}

export function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
}
