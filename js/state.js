// ================================================================
// STATE — Single source of truth for Chronicles
// All game state lives here. All mutations through exported functions.
// ================================================================

import { pickRandom, pickWeighted, random, randomInt } from './rng.js';

// --------------------------------
// Game Data (loaded from JSON)
// --------------------------------
let GAME_DATA = {
    config: null,
    cards: null,
    story: null
};

export function setGameData(data) {
    GAME_DATA = data;
}

export function getGameData() {
    return GAME_DATA;
}

// --------------------------------
// Game State — The G Object
// --------------------------------
export const G = {
    // Seed
    seed: 0,

    // Player
    health: 50,
    maxHealth: 50,
    attack: 15,

    // Cards
    hand: [],           // Up to 3 cards in hand
    drawPile: [],       // Remaining draw pile
    discardPile: [],    // Used / redrawn cards

    // Draw pile
    drawRevealed: false, // Whether top card has been flipped face-up
    redrawsUsed: 0,      // Redraws used this turn

    // Narrative
    currentNodeId: null,
    currentNode: null,
    visitedNodes: new Set(),

    // Narrator
    narratorName: '',
    narratorMood: 'calm',

    // Zone
    currentZone: 0,

    // Hazard
    activeHazard: null,
    cardPlayed: null,   // Card played against current hazard
    lastRoll: null,
    hazardResolved: null, // { success, outcomeNode, total, roll } — pause state after rolling

    // Discovery
    discoveryOffers: [],

    // Game status
    over: false,
    victory: false,

    // Run stats
    nodesVisited: 0,
    cardsPlayed: 0,
    hazardsFaced: 0,
    hazardsWon: 0
};

// --------------------------------
// Initialization
// --------------------------------
export function initGame() {
    const config = GAME_DATA.config;
    if (!config) return;

    // Player stats from config
    G.health = config.player.startingHealth;
    G.maxHealth = config.player.startingHealth;
    G.attack = config.player.startingAttack;

    // Build full deck from config and shuffle (Fisher-Yates)
    const deckIds = config.cards.drawPile.startingCards;
    const deck = deckIds.map(id => ({
        ...GAME_DATA.cards[id],
        id: id
    }));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal starting hand from shuffled deck, remainder becomes draw pile
    G.hand = [];
    for (let i = 0; i < config.player.handSize; i++) {
        if (deck.length > 0) {
            const card = deck.shift();
            G.hand.push({ ...card, faceUp: false });
        }
    }
    G.drawPile = deck;

    // Generate narrator name
    const names = config.narrator.names;
    const first = pickRandom(names.first);
    const title = pickRandom(names.titles);
    G.narratorName = `${first} ${title}`;
    G.narratorMood = 'calm';

    // Set starting node
    G.currentNodeId = 'intro_01';
    G.currentNode = getNodeById('intro_01');

    // Reset status
    G.over = false;
    G.victory = false;
    G.nodesVisited = 0;
    G.cardsPlayed = 0;
    G.hazardsFaced = 0;
    G.hazardsWon = 0;
    G.activeHazard = null;
    G.cardPlayed = null;
    G.lastRoll = null;
    G.hazardResolved = null;
    G.drawRevealed = false;
    G.redrawsUsed = 0;
    G.currentZone = 0;
    G.discardPile = [];
    G.discoveryOffers = [];
    G.visitedNodes = new Set();

    console.log('Game initialized. Narrator:', G.narratorName);
}

// --------------------------------
// Node Navigation
// --------------------------------
export function getNodeById(id) {
    if (!GAME_DATA.story || !GAME_DATA.story.nodes) return null;
    return GAME_DATA.story.nodes.find(n => n.id === id) || null;
}

export function goToNode(nodeId) {
    const node = getNodeById(nodeId);
    if (!node) {
        console.warn('Node not found:', nodeId);
        return null;
    }

    G.currentNodeId = nodeId;
    G.currentNode = node;
    G.visitedNodes.add(nodeId);
    G.nodesVisited++;

    // Zone transition detection
    if (node.zone !== undefined) {
        G.currentZone = node.zone;
    }

    // Victory detection
    if (node.victory) {
        G.victory = true;
        G.over = true;
    }

    // Reset per-encounter state
    G.redrawsUsed = 0;
    G.cardPlayed = null;
    G.lastRoll = null;
    G.hazardResolved = null;

    // Handle node-type-specific setup
    if (node.type === 'hazard' && node.hazard) {
        G.activeHazard = { ...node.hazard };
        G.hazardsFaced++;
    } else {
        G.activeHazard = null;
    }

    // Handle heal nodes
    if (node.heal) {
        heal(node.heal);
    }

    // Handle damage nodes
    if (node.damage) {
        takeDamage(node.damage);
    }

    // Handle random_pool — pick and redirect
    if (node.type === 'random_pool') {
        const picked = pickWeighted(node.pool);
        return goToNode(picked.nodeId);
    }

    // Handle discovery node — populate offers
    if (node.type === 'discovery' && node.offers) {
        G.discoveryOffers = node.offers.map(id => ({
            ...GAME_DATA.cards[id],
            id: id
        }));
    } else {
        G.discoveryOffers = [];
    }

    return node;
}

// --------------------------------
// Health
// --------------------------------
export function takeDamage(amount) {
    G.health = Math.max(0, G.health - amount);
    if (G.health <= 0) {
        G.over = true;
    }
}

export function heal(amount) {
    G.health = Math.min(G.maxHealth, G.health + amount);
}

// --------------------------------
// Flee
// --------------------------------
export function applyFleeCost() {
    const cost = GAME_DATA.config.flee.healthCost || 0;
    if (cost > 0) takeDamage(cost);
    return cost;
}

// --------------------------------
// Hazard Resolution
// --------------------------------
export function resolveHazard(roll) {
    if (!G.activeHazard) return null;

    const card = G.cardPlayed;
    const relevant = G.activeHazard.relevantCards || [];
    const matches = card && relevant.includes(card.category);
    const cardValue = card ? (card.value || 0) : 0;
    const effectiveValue = card ? (matches ? cardValue : Math.floor(cardValue / 2)) : 0;
    const effect = card ? card.effect : null;

    // Bypass — auto-success, no roll needed
    if (effect === 'bypass') {
        G.lastRoll = roll;
        G.hazardsWon++;
        const outcomeNode = G.currentNode.outcomes?.success;
        G.hazardResolved = { success: true, outcomeNode, roll, modifier: 0, total: roll, damage: 0, bypassed: true };
        return G.hazardResolved;
    }

    // Heal — restore HP immediately, then resolve normally
    if (effect === 'heal') {
        G.health = Math.min(G.maxHealth, G.health + effectiveValue);
    }

    // Reroll — roll again and take the better result
    if (effect === 'reroll') {
        const reroll = randomInt(1, 6);
        roll = Math.max(roll, reroll);
    }

    // Difficulty reduce — lower the DC for this roll
    let difficulty = G.activeHazard.difficulty;
    if (effect === 'difficulty_reduce') {
        difficulty = Math.max(1, difficulty - effectiveValue);
    }

    // Roll bonus — add to the roll total
    let modifier = 0;
    if (effect === 'roll_bonus') {
        modifier = effectiveValue;
    }

    const total = roll + modifier;
    G.lastRoll = roll;

    const success = total >= difficulty;

    // Damage reduce — mitigate damage on failure
    let damage = 0;
    if (!success) {
        damage = G.activeHazard.damage;
        if (effect === 'damage_reduce') {
            damage = Math.max(0, damage - effectiveValue);
        }
        takeDamage(damage);
    } else {
        G.hazardsWon++;
    }

    // Store result but don't navigate yet — let player see the outcome
    const outcomeNode = success
        ? G.currentNode.outcomes?.success
        : G.currentNode.outcomes?.failure;

    G.hazardResolved = {
        success,
        outcomeNode,
        roll,
        modifier,
        total,
        damage,
        difficulty,
        cardName: card ? card.name : null,
        cardEffect: effect,
        cardValue: effectiveValue,
        originalDamage: !success ? G.activeHazard.damage : 0
    };

    return G.hazardResolved;
}

// --------------------------------
// Card Management
// --------------------------------
export function flipCard(slotIndex) {
    if (G.hand[slotIndex]) {
        G.hand[slotIndex].faceUp = true;
    }
}

export function playCard(slotIndex) {
    const card = G.hand[slotIndex];
    if (!card || !card.faceUp) return null;

    G.cardPlayed = card;
    G.hand.splice(slotIndex, 1);
    G.discardPile.push(card);
    G.cardsPlayed++;

    return card;
}

export function hasEmptyHandSlot() {
    return G.hand.length < GAME_DATA.config.player.handSize;
}

export function revealDrawPile() {
    if (G.drawPile.length === 0) return null;
    G.drawRevealed = true;
    return G.drawPile[0];
}

export function takeCard() {
    if (G.drawPile.length === 0) return null;
    if (!hasEmptyHandSlot()) return null;
    if (!G.drawRevealed) return null; // Must reveal first

    const card = G.drawPile.shift();
    card.faceUp = true; // Was revealed in draw pile, stays face-up in hand
    G.hand.push(card);
    G.drawRevealed = false;

    return card;
}

export function redraw() {
    if (!G.drawRevealed) return null; // Must reveal first
    if (G.drawPile.length <= 1) return null;

    const config = GAME_DATA.config;
    const maxRedraws = config.cards.drawPile.redrawsPerTurn;
    if (G.redrawsUsed >= maxRedraws) return null;

    // Discard revealed card permanently — it's gone forever
    const discarded = G.drawPile.shift();
    G.discardPile.push(discarded);
    G.redrawsUsed++;
    G.drawRevealed = false;

    return G.drawPile.length > 0 ? G.drawPile[0] : null;
}

// --------------------------------
// Discovery
// --------------------------------
export function pickDiscoveryCard(cardId) {
    const card = G.discoveryOffers.find(c => c.id === cardId);
    if (!card) return null;

    // Shuffle into draw pile
    G.drawPile.push({ ...card, faceUp: false });
    G.discoveryOffers = [];

    // Apply heal on success from config
    const healAmount = GAME_DATA.config.discovery.healOnSuccess;
    if (healAmount) heal(healAmount);

    return card;
}

// --------------------------------
// Restart
// --------------------------------
export function restartGame() {
    initGame();
}

// --------------------------------
// Narrator
// --------------------------------
export function updateNarratorMood() {
    const config = GAME_DATA.config;
    const thresholds = config.narrator.moodThresholds;

    if (G.currentZone >= 2) {
        G.narratorMood = 'unsettled';
    } else if (G.health / G.maxHealth < 0.3) {
        G.narratorMood = 'concerned';
    } else if (G.currentZone === 1) {
        G.narratorMood = G.activeHazard ? 'alert' : 'concerned';
    } else if (G.activeHazard) {
        G.narratorMood = 'alert';
    } else {
        G.narratorMood = 'calm';
    }
}
