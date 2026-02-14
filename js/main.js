// ================================================================
// MAIN — Init, data loading, game loop
// Entry point for Chronicles
// ================================================================

import { initRNG, randomInt, pickRandom } from './rng.js';
import { G, setGameData, initGame, goToNode } from './state.js';
import { cacheDOMElements, renderAll, bindEventHandlers, setRNG } from './ui.js';
import { initAudio } from './audio.js';

// --------------------------------
// Data Loading
// --------------------------------
async function loadGameData() {
    console.log('Loading game data...');

    try {
        // Required files
        const [configRes, cardsRes, storyRes] = await Promise.all([
            fetch('./data/config.json'),
            fetch('./data/cards.json'),
            fetch('./data/story.json')
        ]);

        if (!configRes.ok) throw new Error('Failed to load config.json');
        if (!cardsRes.ok) throw new Error('Failed to load cards.json');
        if (!storyRes.ok) throw new Error('Failed to load story.json');

        const config = await configRes.json();
        const cards = await cardsRes.json();
        const story = await storyRes.json();

        // Strip _meta keys from cards
        const cardData = {};
        for (const [key, value] of Object.entries(cards)) {
            if (key !== '_meta') {
                cardData[key] = value;
            }
        }

        console.log('Data loaded successfully.');
        console.log(`  Cards: ${Object.keys(cardData).length}`);
        console.log(`  Nodes: ${story.nodes.length}`);

        return {
            config: config,
            cards: cardData,
            story: story
        };

    } catch (error) {
        console.error('Failed to load game data:', error);
        throw error;
    }
}

// --------------------------------
// Seed from URL
// --------------------------------
function getSeedFromURL() {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');

    if (seedParam && !isNaN(seedParam)) {
        return parseInt(seedParam, 10);
    }

    // Generate random seed
    return Math.floor(Math.random() * 1000000);
}

// --------------------------------
// Game Loop
// --------------------------------
function updateGame() {
    renderAll();
    checkGameEnd();
}

function checkGameEnd() {
    if (G.over && !G.victory) {
        console.log('Game Over. Nodes visited:', G.nodesVisited);
    }
    if (G.over && G.victory) {
        console.log('Victory! Nodes visited:', G.nodesVisited);
    }
}

// --------------------------------
// Init
// --------------------------------
async function init() {
    console.log('Chronicles starting...');

    try {
        // 1. Load data
        const gameData = await loadGameData();
        setGameData(gameData);

        // 2. Seed RNG
        const seed = getSeedFromURL();
        G.seed = seed;
        initRNG(seed);

        // 3. Wire RNG into UI module
        setRNG({ randomInt, pickRandom });

        // 4. Cache DOM + init audio
        cacheDOMElements();
        initAudio();

        // 5. Init game state
        initGame();

        // 6. Bind events
        bindEventHandlers(updateGame);

        // 7. First render
        renderAll();

        console.log('Chronicles initialized. Seed:', seed);

    } catch (error) {
        console.error('Initialization failed:', error);
        document.body.innerHTML = `
            <div style="color: #ef6b73; text-align: center; padding: 40px; font-family: system-ui;">
                <h1>Failed to load Chronicles</h1>
                <p>${error.message}</p>
                <p>Check the console for details.</p>
            </div>`;
    }
}

// --------------------------------
// Start
// --------------------------------
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
