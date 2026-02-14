// ================================================================
// UI — DOM caching, rendering, and event handling
// Single DOM cache, full re-render on state change
// ================================================================

import { G, goToNode, flipCard, playCard, hasEmptyHandSlot, takeCard,
         redraw, revealDrawPile, pickDiscoveryCard, updateNarratorMood,
         resolveHazard, applyFleeCost, restartGame, getGameData } from './state.js';
import { displayLines, setBackground } from './narrator.js';
import { playSound, playLoop, stopLoop, toggleMute, isMuted } from './audio.js';

// --------------------------------
// Animation State
// --------------------------------
let _prevHealth = null;
let _dieRolling = false;
let _lastNarrativeKey = null;
let _prevZone = 0;
let _prevHazardActive = false;

function displayConfig() {
    return getGameData().config?.display || {};
}

// --------------------------------
// DOM Cache
// --------------------------------
let DOM = {};

export function cacheDOMElements() {
    DOM = {
        // Narrator
        narratorPortrait: document.getElementById('narrator-portrait'),
        portraitFrame: document.querySelector('.portrait-frame'),
        narratorName: document.getElementById('narrator-name'),

        // Stats
        healthBar: document.getElementById('health-bar'),
        healthValue: document.getElementById('health-value'),
        attackBar: document.getElementById('attack-bar'),
        attackValue: document.getElementById('attack-value'),

        // Draw pile
        drawPile: document.getElementById('draw-pile'),
        drawCard: document.getElementById('draw-card'),
        drawSigil: document.getElementById('draw-sigil'),
        drawCount: document.getElementById('draw-count'),
        btnTakeCard: document.getElementById('btn-take-card'),
        btnRedraw: document.getElementById('btn-redraw'),

        // Seed
        seedValue: document.getElementById('seed-value'),

        // Narrative
        narrativePanel: document.getElementById('narrative-panel'),
        narrativeBg: document.getElementById('narrative-bg'),
        narrativeText: document.getElementById('narrative-text'),

        // Hand
        hand: document.getElementById('hand'),
        handCards: document.querySelectorAll('.hand-card'),

        // Hazard viewport
        hazardSlot: document.getElementById('hazard-slot'),
        hazardLabel: document.getElementById('hazard-label'),
        hazardFrame: document.getElementById('hazard-card'),
        hazardImage: document.getElementById('hazard-image'),
        hazardInfo: document.getElementById('hazard-info'),

        // Context buttons
        contextButtons: document.getElementById('context-buttons'),
        btnContext1: document.getElementById('btn-context-1'),
        btnContext2: document.getElementById('btn-context-2'),
        btnContext3: document.getElementById('btn-context-3'),

        // Die
        dieContainer: document.getElementById('die-container'),
        die: document.getElementById('die'),
        dieFace: document.getElementById('die-face'),

        // Board (for screen shake)
        board: document.querySelector('.board'),

        // Audio
        btnMute: document.getElementById('btn-mute')
    };
}

// --------------------------------
// Update callback (set by bindEventHandlers)
// --------------------------------
let _updateCallback = null;

// --------------------------------
// Render All
// --------------------------------
export function renderAll() {
    // Game over check
    if (G.over) {
        renderGameOver();
        return;
    }

    // Zone transition sound
    if (G.currentZone !== _prevZone) {
        if (_prevZone !== 0 || G.currentZone !== 0) {
            playSound('zone_transition');
        }
        _prevZone = G.currentZone;
    }

    updateNarratorMood();
    renderNarrator();
    renderStats();
    renderDrawPile();
    renderNarrative();
    renderHand();
    renderHazard();
    renderContextButtons();
    renderDie();
    renderSeed();
}

// --------------------------------
// Individual Renderers
// --------------------------------

function renderNarrator() {
    if (!DOM.narratorName) return;
    DOM.narratorName.textContent = G.narratorName || 'The Narrator';
}

function renderStats() {
    if (!DOM.healthBar) return;

    const healthPct = (G.health / G.maxHealth) * 100;
    DOM.healthBar.style.width = healthPct + '%';
    DOM.healthValue.textContent = `${G.health}/${G.maxHealth}`;

    // Health color states
    DOM.healthBar.className = 'stat-bar-fill health-fill';
    if (healthPct <= 20) {
        DOM.healthBar.classList.add('critical');
    } else if (healthPct <= 50) {
        DOM.healthBar.classList.add('low');
    }

    // Heal feedback — sound when health increases
    if (_prevHealth !== null && G.health > _prevHealth) {
        playSound('heal');
    }

    // Damage feedback — flash health bar + shake board + sound
    if (_prevHealth !== null && G.health < _prevHealth) {
        const bar = DOM.healthBar.parentElement;
        bar.classList.remove('damage-flash');
        DOM.board.classList.remove('screen-shake');
        void bar.offsetWidth; // force reflow to restart animation
        bar.classList.add('damage-flash');
        DOM.board.classList.add('screen-shake');
        bar.addEventListener('animationend', () => bar.classList.remove('damage-flash'), { once: true });
        DOM.board.addEventListener('animationend', () => DOM.board.classList.remove('screen-shake'), { once: true });
        playSound('damage_hit');
    }
    _prevHealth = G.health;

    DOM.attackValue.textContent = G.attack;
}

function renderDrawPile() {
    if (!DOM.drawCount) return;
    DOM.drawCount.textContent = `${G.drawPile.length} remaining`;

    if (G.drawPile.length > 0 && G.drawRevealed) {
        // Show card front — revealed top card
        const topCard = G.drawPile[0];
        DOM.drawCard.innerHTML = `
            <div class="card-face card-front">
                <div class="card-name">${topCard.name}</div>
                <div class="card-sigil ${topCard.category}" style="width:28px;height:28px"></div>
                <div class="card-category ${topCard.category}">${topCard.category.replace('_', ' ')}</div>
                <div class="card-effect">${topCard.description || ''}</div>
            </div>`;
    } else {
        // Show card back with sigil hint
        const sigilClass = G.drawPile.length > 0 ? G.drawPile[0].category : '';
        DOM.drawCard.innerHTML = `
            <div class="card-back">
                <div class="card-sigil ${sigilClass}" id="draw-sigil"></div>
            </div>`;
    }

    // Buttons only usable after revealing
    const takeEnabled = G.drawRevealed && hasEmptyHandSlot() && G.drawPile.length > 0;
    const redrawEnabled = G.drawRevealed && G.drawPile.length > 1;
    DOM.btnTakeCard.disabled = !takeEnabled;
    DOM.btnRedraw.disabled = !redrawEnabled;
    DOM.btnTakeCard.classList.toggle('interactive', takeEnabled);
    DOM.btnRedraw.classList.toggle('interactive', redrawEnabled);

    // "Click to reveal" hint when face-down and cards remain
    const existingHint = DOM.drawPile.querySelector('.draw-hint');
    if (existingHint) existingHint.remove();
    if (G.drawPile.length > 0 && !G.drawRevealed) {
        const hint = document.createElement('div');
        hint.className = 'draw-hint';
        hint.textContent = 'Click to reveal';
        DOM.drawCard.after(hint);
    }
}

function renderNarrative() {
    if (!DOM.narrativeText || !G.currentNode) return;

    const node = G.currentNode;

    const lineDelay = displayConfig().narrativeLineDelay || 0;

    // Build a cache key to skip re-render when content hasn't changed
    const narrativeKey = G.hazardResolved
        ? `hazard:${G.hazardResolved.roll}:${G.hazardResolved.success}`
        : `node:${node.id}`;
    if (narrativeKey === _lastNarrativeKey) return;
    _lastNarrativeKey = narrativeKey;

    // If hazard is resolved, show outcome text instead of node lines
    if (G.hazardResolved) {
        const r = G.hazardResolved;
        const lines = [];
        if (r.bypassed) {
            lines.push(`${r.cardName} bypasses the hazard.`);
        } else {
            // Card effect line
            if (r.cardName && r.cardEffect === 'heal') {
                lines.push(`${r.cardName} restores ${r.cardValue} HP.`);
            }

            // Roll line
            if (r.modifier > 0) {
                lines.push(`Roll: ${r.roll} + ${r.modifier} (${r.cardName}) = ${r.total}`);
            } else {
                lines.push(`Roll: ${r.total}`);
            }

            // Needed line — show reduced DC if difficulty_reduce was used
            const originalDC = G.activeHazard?.difficulty || '?';
            if (r.cardEffect === 'difficulty_reduce' && r.difficulty < originalDC) {
                lines.push(`Needed: ${originalDC} \u2192 ${r.difficulty} (${r.cardName})`);
            } else {
                lines.push(`Needed: ${r.difficulty}`);
            }

            // Result line
            if (r.success) {
                lines.push('Success.');
            } else if (r.cardEffect === 'damage_reduce' && r.damage < r.originalDamage) {
                lines.push(`Failed. ${r.originalDamage} dmg \u2192 ${r.damage} (${r.cardName}).`);
            } else {
                lines.push(`Failed. You take ${r.damage} damage.`);
            }
        }
        displayLines(lines, DOM.narrativeText, lineDelay);
        return;
    }

    // Display text lines
    if (node.lines) {
        displayLines(node.lines, DOM.narrativeText, lineDelay);
    }

    // Set background
    if (node.background) {
        setBackground(node.background, DOM.narrativeBg);
    }
}

function renderHand() {
    if (!DOM.hand) return;

    DOM.hand.innerHTML = '';

    // Check if we're in a hazard where cards can be played
    const inPlayableHazard = G.activeHazard && !G.hazardResolved && !G.cardPlayed;
    const relevantCategories = inPlayableHazard
        ? (G.activeHazard.relevantCards || [])
        : [];

    for (let i = 0; i < 3; i++) {
        const card = G.hand[i];
        const cardEl = document.createElement('div');
        cardEl.className = 'hand-card';
        cardEl.dataset.slot = i;

        if (!card) {
            // Empty slot — show "Draw" hint if draw pile has cards
            cardEl.innerHTML = `
                <div class="card-face card-back" style="opacity: 0.3">
                    ${G.drawPile.length > 0 ? '<span class="empty-slot-hint">Draw</span>' : '<div class="card-sigil"></div>'}
                </div>`;
        } else if (!card.faceUp) {
            // Face down — 3D flip structure (both faces in DOM, CSS handles visibility)
            cardEl.innerHTML = `
                <div class="card-inner">
                    <div class="card-face card-back">
                        <div class="card-sigil ${card.category}"></div>
                    </div>
                    <div class="card-face card-front">
                        <div class="card-name">${card.name}</div>
                        <div class="card-sigil ${card.category}" style="width:28px;height:28px"></div>
                        <div class="card-category ${card.category}">${card.category.replace('_', ' ')}</div>
                        <div class="card-effect">${card.description || ''}</div>
                    </div>
                </div>`;
            cardEl.addEventListener('click', () => handleCardClick(i));
        } else {
            // Face up — show card details
            cardEl.innerHTML = `
                <div class="card-face card-front">
                    <div class="card-name">${card.name}</div>
                    <div class="card-sigil ${card.category}" style="width:28px;height:28px"></div>
                    <div class="card-category ${card.category}">${card.category.replace('_', ' ')}</div>
                    <div class="card-effect">${card.description || ''}</div>
                </div>`;
            cardEl.addEventListener('click', () => handleCardClick(i));

            // Highlight relevant cards during hazard
            if (inPlayableHazard && relevantCategories.includes(card.category)) {
                cardEl.classList.add('relevant', card.category);
            }
        }

        DOM.hand.appendChild(cardEl);
    }
}

function renderHazard() {
    if (!DOM.hazardFrame) return;

    // Clear previous result classes
    DOM.hazardFrame.classList.remove('result-success', 'result-failure');

    if (G.activeHazard) {
        // Hazard start sound — play once when hazard first activates
        if (!_prevHazardActive) {
            playSound('hazard_start');
        }
        _prevHazardActive = true;
        DOM.hazardFrame.classList.add('active');

        // Show encounter image (same source as narrative background)
        const bg = G.currentNode?.background;
        if (bg) {
            DOM.hazardImage.style.backgroundImage = `url('assets/encounters/${bg}.png')`;
        } else {
            DOM.hazardImage.style.backgroundImage = 'none';
        }

        // Show encounter info overlay
        DOM.hazardInfo.innerHTML = `
            <div class="hazard-name">${G.activeHazard.name}</div>
            <div class="hazard-difficulty">DC ${G.activeHazard.difficulty}</div>
            <div class="hazard-damage">${G.activeHazard.damage} dmg</div>`;

        DOM.hazardLabel.textContent = 'You face:';

        // Hazard result flash + sound
        if (G.hazardResolved) {
            void DOM.hazardFrame.offsetWidth;
            DOM.hazardFrame.classList.add(
                G.hazardResolved.success ? 'result-success' : 'result-failure'
            );
            playSound(G.hazardResolved.success ? 'hazard_success' : 'hazard_failure');
            DOM.hazardFrame.addEventListener('animationend', () => {
                DOM.hazardFrame.classList.remove('result-success', 'result-failure');
            }, { once: true });
        }
    } else {
        _prevHazardActive = false;
        DOM.hazardFrame.classList.remove('active');
        DOM.hazardImage.style.backgroundImage = 'none';
        DOM.hazardInfo.innerHTML = '<div class="hazard-placeholder">&mdash;</div>';
        DOM.hazardLabel.textContent = 'You face:';
    }
}

function renderContextButtons() {
    if (!DOM.btnContext1) return;

    // Reset disabled state on all buttons every render
    DOM.btnContext1.disabled = false;
    DOM.btnContext2.disabled = false;
    DOM.btnContext3.disabled = false;

    const node = G.currentNode;
    if (!node) return;

    // If hazard was resolved, show Continue to proceed to outcome
    if (G.hazardResolved) {
        DOM.btnContext1.textContent = 'Continue';
        DOM.btnContext1.className = 'btn-context interactive';
        DOM.btnContext2.className = 'btn-context hidden';
        DOM.btnContext3.className = 'btn-context hidden';
        return;
    }

    switch (node.type) {
        case 'story':
            DOM.btnContext1.textContent = 'Continue';
            DOM.btnContext1.className = 'btn-context interactive';
            DOM.btnContext2.textContent = '';
            DOM.btnContext2.className = 'btn-context hidden';
            DOM.btnContext3.textContent = '';
            DOM.btnContext3.className = 'btn-context hidden';
            break;

        case 'choice':
            if (node.buttons && node.buttons.length >= 1) {
                DOM.btnContext1.textContent = node.buttons[0].label;
                DOM.btnContext1.className = 'btn-context interactive';
            }
            if (node.buttons && node.buttons.length >= 2) {
                DOM.btnContext2.textContent = node.buttons[1].label;
                DOM.btnContext2.className = 'btn-context interactive';
            } else {
                DOM.btnContext2.className = 'btn-context hidden';
            }
            if (node.buttons && node.buttons.length >= 3) {
                DOM.btnContext3.textContent = node.buttons[2].label;
                DOM.btnContext3.className = 'btn-context interactive';
            } else {
                DOM.btnContext3.className = 'btn-context hidden';
            }
            break;

        case 'hazard':
            // Show card-played indicator if a card was already used
            if (G.cardPlayed) {
                DOM.btnContext1.textContent = `${G.cardPlayed.name} played`;
                DOM.btnContext1.className = 'btn-context';
                DOM.btnContext1.disabled = true;
            } else {
                DOM.btnContext1.textContent = node.buttons?.[0]?.label || 'Play Card';
                DOM.btnContext1.className = 'btn-context interactive';
                DOM.btnContext1.disabled = false;
            }
            DOM.btnContext2.textContent = node.buttons?.[1]?.label || 'Roll Die';
            DOM.btnContext2.className = 'btn-context interactive';
            DOM.btnContext3.textContent = node.buttons?.[2]?.label || 'Flee';
            DOM.btnContext3.className = 'btn-context interactive';
            break;

        case 'discovery':
            DOM.btnContext1.textContent = 'Choose a card above';
            DOM.btnContext1.className = 'btn-context';
            DOM.btnContext2.className = 'btn-context hidden';
            DOM.btnContext3.className = 'btn-context hidden';
            renderDiscoveryOffers();
            break;

        default:
            DOM.btnContext1.textContent = 'Continue';
            DOM.btnContext1.className = 'btn-context interactive';
            DOM.btnContext2.className = 'btn-context hidden';
            DOM.btnContext3.className = 'btn-context hidden';
    }
}

function renderDiscoveryOffers() {
    // Show discovery cards in the narrative panel area
    if (G.discoveryOffers.length === 0) return;

    // Skip if already rendered (narrative cache key prevents clearing)
    if (DOM.narrativeText.querySelector('.discovery-offers')) return;

    const offersDiv = document.createElement('div');
    offersDiv.className = 'discovery-offers';
    offersDiv.style.marginTop = '20px';

    for (const card of G.discoveryOffers) {
        const cardEl = document.createElement('div');
        cardEl.className = 'discovery-card';
        cardEl.innerHTML = `
            <div class="card-face card-back">
                <div class="card-sigil ${card.category}"></div>
            </div>`;
        cardEl.addEventListener('click', () => {
            playSound('discovery_pick');
            pickDiscoveryCard(card.id);
            if (G.currentNode.next) {
                goToNode(G.currentNode.next);
            }
            renderAll();
        });
        offersDiv.appendChild(cardEl);
    }

    DOM.narrativeText.appendChild(offersDiv);
}

function renderDie() {
    if (!DOM.dieFace) return;

    if (G.lastRoll !== null) {
        DOM.dieFace.textContent = G.lastRoll;
    } else {
        DOM.dieFace.textContent = '?';
    }

    // Interactive hint — gold glow when die can be rolled
    const canRoll = G.activeHazard && !G.hazardResolved;
    DOM.die.classList.toggle('interactive', canRoll);
}

function renderSeed() {
    if (!DOM.seedValue) return;
    DOM.seedValue.textContent = G.seed;
}

// --------------------------------
// Game Over Screen
// --------------------------------
function renderGameOver() {
    renderStats();
    renderSeed();

    const isVictory = G.victory;
    const title = isVictory ? 'Victory' : 'Game Over';
    const lines = [];

    if (isVictory) {
        lines.push('The story reaches its end.');
        lines.push('You survived.');
    } else {
        lines.push('The story goes on without you.');
        lines.push('Darkness takes hold.');
    }

    _lastNarrativeKey = 'gameover:' + (isVictory ? 'victory' : 'death');
    playSound(isVictory ? 'game_over_victory' : 'game_over_death');
    displayLines(lines, DOM.narrativeText);

    // Show run stats in hazard viewport
    DOM.hazardFrame.classList.remove('active');
    DOM.hazardImage.style.backgroundImage = 'none';
    DOM.hazardInfo.innerHTML = `
        <div class="hazard-name" style="font-size:0.7rem; color: var(--muted)">
            Nodes: ${G.nodesVisited}<br>
            Hazards: ${G.hazardsWon}/${G.hazardsFaced}<br>
            Cards: ${G.cardsPlayed}
        </div>`;
    DOM.hazardLabel.textContent = title;

    // Context buttons — restart
    DOM.btnContext1.textContent = 'Play Again';
    DOM.btnContext1.className = 'btn-context interactive';
    DOM.btnContext1.disabled = false;
    DOM.btnContext2.className = 'btn-context hidden';
    DOM.btnContext3.className = 'btn-context hidden';

    // Die shows nothing
    DOM.dieFace.textContent = '—';
}

// --------------------------------
// Event Handlers
// --------------------------------

function handleCardClick(slotIndex) {
    if (G.over) return;
    const card = G.hand[slotIndex];
    if (!card) return;

    // Face-down card — animate flip, then update state
    if (!card.faceUp) {
        const duration = displayConfig().cardFlipDuration || 400;
        const cardEl = DOM.hand.querySelectorAll('.hand-card')[slotIndex];
        const inner = cardEl?.querySelector('.card-inner');

        if (inner && !inner.classList.contains('flipped')) {
            inner.style.transitionDuration = duration + 'ms';
            inner.classList.add('flipped');
            playSound('card_flip');
            setTimeout(() => {
                flipCard(slotIndex);
                renderAll();
            }, duration);
        }
        return;
    }

    // Face-up card during hazard — play it immediately
    if (G.activeHazard && !G.hazardResolved && !G.cardPlayed) {
        playSound('card_play');
        playCard(slotIndex);
        renderAll();
    }
}

export function bindEventHandlers(updateCallback) {
    _updateCallback = updateCallback;

    // Context buttons — skip updateCallback when die animation is running
    DOM.btnContext1.addEventListener('click', () => {
        playSound('ui_button_click');
        handleContextButton(0);
        if (!_dieRolling) updateCallback();
    });
    DOM.btnContext2.addEventListener('click', () => {
        playSound('ui_button_click');
        handleContextButton(1);
        if (!_dieRolling) updateCallback();
    });
    DOM.btnContext3.addEventListener('click', () => {
        playSound('ui_button_click');
        handleContextButton(2);
        if (!_dieRolling) updateCallback();
    });

    // Draw pile — click card to reveal, then Take or Redraw
    DOM.drawCard.addEventListener('click', () => {
        if (G.over) return;
        if (!G.drawRevealed && G.drawPile.length > 0) {
            playSound('card_reveal');
            revealDrawPile();
            updateCallback();
        }
    });
    DOM.btnTakeCard.addEventListener('click', () => {
        if (G.over) return;
        playSound('card_draw');
        takeCard();
        updateCallback();
    });
    DOM.btnRedraw.addEventListener('click', () => {
        if (G.over) return;
        playSound('card_redraw');
        redraw();
        updateCallback();
    });

    // Die click — handleDieRoll manages its own renderAll() after animation
    DOM.die.addEventListener('click', () => {
        if (G.over) return;
        if (G.activeHazard && !G.hazardResolved) {
            handleDieRoll();
        }
    });

    // Spacebar to continue on story nodes
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleContextButton(0);
            if (!_dieRolling) updateCallback();
        }
    });

    // Seed click — copy to clipboard
    DOM.seedValue.addEventListener('click', () => {
        navigator.clipboard.writeText(G.seed.toString());
    });

    // Mute toggle
    if (isMuted()) DOM.btnMute.classList.add('muted');
    DOM.btnMute.addEventListener('click', () => {
        const muted = toggleMute();
        DOM.btnMute.classList.toggle('muted', muted);
    });
}

function handleContextButton(index) {
    const node = G.currentNode;
    if (!node) return;

    // Game over — restart
    if (G.over) {
        if (index === 0) {
            restartGame();
            renderAll();
        }
        return;
    }

    // Hazard resolved — Continue navigates to outcome
    if (G.hazardResolved) {
        if (index === 0 && G.hazardResolved.outcomeNode) {
            const outcomeNode = G.hazardResolved.outcomeNode;
            G.activeHazard = null;
            G.hazardResolved = null;
            goToNode(outcomeNode);
            renderAll();
        }
        return;
    }

    switch (node.type) {
        case 'story':
            if (node.next) {
                goToNode(node.next);
                renderAll();
            }
            break;

        case 'choice':
            if (node.buttons && node.buttons[index]) {
                goToNode(node.buttons[index].next);
                renderAll();
            }
            break;

        case 'hazard':
            handleHazardButton(index);
            break;

        case 'discovery':
            // Handled by discovery card clicks
            break;
    }
}

function handleHazardButton(index) {
    const node = G.currentNode;
    if (!node || !node.buttons) return;

    const button = node.buttons[index];
    if (!button) return;

    switch (button.action) {
        case 'play_card':
            // Handled via card click system — just a hint to the player
            break;

        case 'roll_only':
            handleDieRoll();
            break;

        case 'flee':
            playSound('flee');
            applyFleeCost();
            if (button.next) {
                goToNode(button.next);
            }
            renderAll();
            break;
    }
}

function handleDieRoll() {
    if (!G.activeHazard || G.hazardResolved) return;
    if (_dieRolling) return;

    const duration = displayConfig().dieRollDuration || 800;
    const { randomInt } = await_rng();

    _dieRolling = true;
    DOM.die.classList.add('rolling');
    playLoop('die_roll');

    // Cycle random display numbers during animation
    const cycleInterval = setInterval(() => {
        DOM.dieFace.textContent = Math.floor(Math.random() * 6) + 1;
    }, 80);

    setTimeout(() => {
        clearInterval(cycleInterval);
        DOM.die.classList.remove('rolling');
        stopLoop('die_roll');

        // Actual seeded roll + resolve
        const roll = randomInt(1, 6);
        resolveHazard(roll);

        // Show result with landing animation + sound
        DOM.dieFace.textContent = roll;
        playSound('die_land');
        DOM.die.classList.add('roll-land');
        DOM.die.addEventListener('animationend', () => {
            DOM.die.classList.remove('roll-land');
        }, { once: true });

        _dieRolling = false;
        renderAll();
    }, duration);
}

// Lazy RNG import to avoid circular dependency
let _rng = null;
function await_rng() {
    if (!_rng) {
        // Will be set by main.js after import
        _rng = window._chroniclesRNG || { randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min };
    }
    return _rng;
}

export function setRNG(rngModule) {
    _rng = rngModule;
}
