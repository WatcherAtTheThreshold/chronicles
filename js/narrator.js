// ================================================================
// NARRATOR — Text display and narrator state
// Handles rendering narrative text in the panel
// ================================================================

// --------------------------------
// Text Display
// --------------------------------

let _lineTimers = [];

/**
 * Display lines in the narrative panel with optional staggered fade-in
 * @param {string[]} lines - Array of text lines to display
 * @param {HTMLElement} container - The narrative-text element
 * @param {number} lineDelay - ms between each line reveal (0 = instant)
 */
export function displayLines(lines, container, lineDelay = 0) {
    // Clear any pending timers from a previous call
    for (const id of _lineTimers) clearTimeout(id);
    _lineTimers = [];

    container.innerHTML = '';

    for (let i = 0; i < lines.length; i++) {
        const p = document.createElement('p');
        p.textContent = lines[i];

        if (lineDelay > 0) {
            p.className = 'line-hidden';
            const timerId = setTimeout(() => {
                p.classList.remove('line-hidden');
                p.classList.add('line-visible');
            }, i * lineDelay);
            _lineTimers.push(timerId);
        }

        container.appendChild(p);
    }
}

/**
 * Set background image on the narrative panel
 * @param {string} backgroundId - Background identifier
 * @param {HTMLElement} bgElement - The narrative-bg element
 */
export function setBackground(backgroundId, bgElement) {
    if (!backgroundId) {
        bgElement.style.backgroundImage = 'none';
        return;
    }

    // Try to load from assets/encounters/
    const path = `assets/encounters/${backgroundId}.png`;
    bgElement.style.backgroundImage = `url('${path}')`;
}

/**
 * Clear the narrative panel
 */
export function clearNarrative(container, bgElement) {
    container.innerHTML = '';
    bgElement.style.backgroundImage = 'none';
}
