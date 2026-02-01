// ============================================
// SQL ESCAPE ROOM - GAME CONTROLLER
// ============================================

// Game Configuration
const CONFIG = {
    totalLevels: 5,
    initialTime: 900, // 15 minutes in seconds
    pointsPerLevel: 100,
    apiBase: '/api'
};

// Game State
const state = {
    currentScreen: 'doorScreen',
    currentLevel: 1,
    timer: null,
    timeRemaining: CONFIG.initialTime,
    score: 0,
    isAnswerCorrect: false,
    currentQuestionData: null,
    currentUnlockCode: null,
    playerName: '',
    playerRollNo: ''
};

// DOM Elements Cache (cached once at startup for performance)
const elements = {
    screens: null,
    topBar: null,
    currentLevelText: null,
    countdownTimer: null,
    levelTitle: null,
    levelBadge: null,
    questionText: null,
    datasetContainer: null,
    answerSection: null,
    answerInput: null,
    unlockBtn: null,
    nextLevelBtn: null,
    feedback: null,
    successOverlay: null,
    accessCodeContainer: null,
    accessCodeInput: null
};

// Initialize DOM References
function cacheElements() {
    elements.screens = {
        doorScreen: document.getElementById('doorScreen'),
        eventLandingScreen: document.getElementById('eventLandingScreen'),
        registrationScreen: document.getElementById('registrationScreen'),
        gameplayScreen: document.getElementById('gameplayScreen'),
        finalScreen: document.getElementById('finalScreen')
    };
    elements.topBar = document.getElementById('topBar');
    elements.currentLevelText = document.getElementById('currentLevelText');
    elements.countdownTimer = document.getElementById('countdownTimer');
    elements.levelTitle = document.getElementById('questionTitle');
    elements.levelBadge = document.getElementById('levelBadge');
    elements.questionText = document.getElementById('questionText');
    elements.datasetContainer = document.getElementById('datasetContainer');
    elements.answerSection = document.getElementById('answerSection');
    elements.answerInput = document.getElementById('answerInput');
    elements.unlockBtn = document.getElementById('unlockBtn');
    elements.nextLevelBtn = document.getElementById('nextLevelBtn');
    elements.feedback = document.getElementById('feedback');
    elements.successOverlay = document.getElementById('successOverlay');
    elements.accessCodeContainer = document.getElementById('accessCodeContainer');
    elements.accessCodeInput = document.getElementById('accessCodeInput');
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Door Screen
    document.getElementById('doorInteractBtn').addEventListener('click', handleDoorOpen);

    // Landing Screen
    document.getElementById('enterArenaBtn').addEventListener('click', startArena);

    // Registration Screen
    document.getElementById('startGameBtn').addEventListener('click', handleRegistration);
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegistration();
    });
    document.getElementById('playerRollNo').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegistration();
    });

    // Gameplay Screen
    elements.unlockBtn.addEventListener('click', checkAnswer);
    elements.nextLevelBtn.addEventListener('click', goToNextLevel);
    document.getElementById('verifyCodeBtn').addEventListener('click', verifyAccessCode);

    // SQL Input: Ctrl+Enter to submit, Enter creates new line (default)
    elements.answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            checkAnswer();
        }
        // Regular Enter creates new line automatically (default textarea behavior)
    });

    // Allow Enter key on access code input
    elements.accessCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyAccessCode();
    });

    // Final Screen
    document.getElementById('restartBtn').addEventListener('click', restartGame);
}

// ============================================
// NAVIGATION
// ============================================
function showScreen(screenId) {
    Object.entries(elements.screens).forEach(([id, el]) => {
        if (id === screenId) {
            el.classList.remove('hidden');
            el.classList.add('active');
        } else {
            el.classList.add('hidden');
            el.classList.remove('active');
        }
    });
    state.currentScreen = screenId;
}

function handleDoorOpen() {
    const doorSystem = document.querySelector('.door-system');
    doorSystem.classList.add('door-opening');

    setTimeout(() => showScreen('eventLandingScreen'), 1000);
}

function startArena() {
    showScreen('registrationScreen');
}

// ============================================
// REGISTRATION HANDLER
// ============================================
function handleRegistration() {
    const playerName = document.getElementById('playerName').value.trim();
    const playerRollNo = document.getElementById('playerRollNo').value.trim();

    // Validation
    if (!playerName) {
        alert('Please enter your name');
        document.getElementById('playerName').focus();
        return;
    }

    if (!playerRollNo) {
        alert('Please enter your roll number');
        document.getElementById('playerRollNo').focus();
        return;
    }

    // Store player info
    state.playerName = playerName;
    state.playerRollNo = playerRollNo;

    // Save player registration immediately to storage
    const playerInfo = {
        name: playerName,
        rollNo: playerRollNo,
        registeredAt: new Date().toISOString(),
        status: 'playing'
    };
    
    try {
        // Try localStorage first, fall back to sessionStorage
        try {
            localStorage.setItem('currentPlayer', JSON.stringify(playerInfo));
            const retrieved = localStorage.getItem('currentPlayer');
            console.log('✅ Saved to LocalStorage:', playerInfo);
        } catch (e) {
            // If localStorage fails, use sessionStorage
            sessionStorage.setItem('currentPlayer', JSON.stringify(playerInfo));
            const retrieved = sessionStorage.getItem('currentPlayer');
            console.log('✅ Saved to SessionStorage:', playerInfo);
        }
    } catch (e) {
        console.error('❌ Storage Error:', e);
    }

    // Start the game
    showScreen('gameplayScreen');
    elements.topBar.classList.remove('hidden');
    document.querySelector('.container').classList.add('with-topbar');
    startTimer();
    loadLevel(1);
}

// ============================================
// TIMER
// ============================================
function startTimer() {
    state.timer = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();

        if (state.timeRemaining <= 0) {
            clearInterval(state.timer);
            finishGame(false);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    elements.countdownTimer.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Visual warning when time is low
    if (state.timeRemaining < 60) {
        elements.countdownTimer.style.color = 'var(--error)';
    }
}

// ============================================
// LEVEL LOADING
// ============================================
async function loadLevel(levelId) {
    try {
        const response = await fetch(`${CONFIG.apiBase}/question/${levelId}`);
        if (!response.ok) throw new Error('Level failed to load');

        const question = await response.json();
        state.currentQuestionData = question;
        state.currentLevel = levelId;

        renderLevelState(question);
    } catch (err) {
        console.error('Load Error:', err);
        showFeedback('ERROR LOADING LEVEL', 'error');
    }
}

function renderLevelState(q) {
    // Update Header
    elements.currentLevelText.textContent = q.id;
    elements.levelTitle.textContent = q.title;
    elements.levelBadge.textContent = q.level;

    // Mission Reveal
    elements.questionText.textContent = q.gatekeeperMessage;

    // Render Schema
    renderSchemaInfo(q);

    // Reset State
    state.isAnswerCorrect = false;
    state.currentUnlockCode = null;

    // Reset UI
    elements.answerSection.classList.remove('locked');
    elements.answerInput.value = '';
    elements.answerInput.disabled = false;

    elements.unlockBtn.disabled = false;
    elements.unlockBtn.textContent = "⚡ REQUEST ACCESS / EXECUTE";
    elements.unlockBtn.classList.remove('hidden', 'validating');

    elements.accessCodeContainer.classList.add('hidden');
    elements.accessCodeInput.value = '';
    elements.nextLevelBtn.classList.add('hidden');

    hideFeedback();
}

function renderSchemaInfo(q) {
    elements.datasetContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'schema-wrapper';

    // Header
    const header = document.createElement('div');
    header.className = 'schema-header';
    header.innerHTML = `<span class="schema-label">TARGET SYSTEM SCHEMA</span> <span class="schema-status">🔒 PROTECTED</span>`;
    wrapper.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'schema-content';

    if (q.tables) {
        content.innerHTML = Object.entries(q.tables)
            .map(([name, table]) => `
                <div class="table-def">
                    <span class="table-name">📁 ${name.toUpperCase()}</span>
                    <span class="columns">[ ${table.columns.join(', ')} ]</span>
                </div>
            `).join('');
    }

    wrapper.appendChild(content);
    elements.datasetContainer.appendChild(wrapper);
}

// ============================================
// ANSWER CHECKING
// ============================================
async function checkAnswer() {
    const query = elements.answerInput.value.trim();
    if (!query) return;

    // Visual feedback
    elements.unlockBtn.classList.add('validating');
    elements.unlockBtn.textContent = "🔍 VALIDATING ACCESS...";
    hideFeedback();

    try {
        // Narrative delay
        await delay(1500);

        const response = await fetch(`${CONFIG.apiBase}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: state.currentLevel, userAnswer: query })
        });

        const result = await response.json();

        if (result.correct) {
            state.currentUnlockCode = result.unlockCode;
            handleSuccess(result.unlockCode);
        } else {
            handleFailure(result.error || 'Query rejected');
        }
    } catch (err) {
        showFeedback('CONNECTION INTERRUPTED', 'error');
        resetExecuteButton();
    }
}

function handleSuccess(code) {
    // Show overlay with code
    const overlayTitle = document.querySelector('.overlay-title');
    overlayTitle.innerHTML = `ACCESS GRANTED<br><span style="color:#fff; font-size:0.8em;">CODE: ${code}</span>`;
    elements.successOverlay.classList.remove('hidden');

    // After delay, show code input
    setTimeout(() => {
        elements.successOverlay.classList.add('hidden');
        overlayTitle.textContent = "ACCESS GRANTED";

        showFeedback(`Security Clearance Verified. Enter Code: ${code}`, 'success');

        state.isAnswerCorrect = true;
        state.score += CONFIG.pointsPerLevel;

        elements.answerInput.disabled = true;
        elements.unlockBtn.classList.add('hidden');

        elements.accessCodeContainer.classList.remove('hidden');
        elements.accessCodeInput.focus();
    }, 3000);
}

function handleFailure(errorMsg) {
    showFeedback(`ACCESS DENIED – ${errorMsg}`, 'error');
    resetExecuteButton();
}

function resetExecuteButton() {
    elements.unlockBtn.classList.remove('validating');
    elements.unlockBtn.textContent = "⚡ REQUEST ACCESS / EXECUTE";
}

// ============================================
// ACCESS CODE VERIFICATION
// ============================================
function verifyAccessCode() {
    const val = elements.accessCodeInput.value.trim();

    if (val === state.currentUnlockCode) {
        showFeedback('IDENTITY CONFIRMED. PROCEED.', 'success');
        elements.accessCodeContainer.classList.add('hidden');
        elements.nextLevelBtn.classList.remove('hidden');
        elements.nextLevelBtn.disabled = false;
        elements.nextLevelBtn.focus();
    } else {
        showFeedback('INVALID ACCESS CODE', 'error');
        elements.accessCodeInput.value = '';
        elements.accessCodeInput.focus();
    }
}

// ============================================
// LEVEL PROGRESSION
// ============================================
function goToNextLevel() {
    if (state.currentLevel < CONFIG.totalLevels) {
        loadLevel(state.currentLevel + 1);
    } else {
        finishGame(true);
    }
}

function finishGame(success) {
    clearInterval(state.timer);
    showScreen('finalScreen');
    elements.topBar.classList.add('hidden');

    const timeTaken = CONFIG.initialTime - state.timeRemaining;
    const mins = Math.floor(timeTaken / 60);
    const secs = timeTaken % 60;

    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('finalTime').textContent =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Save player score (localStorage for now)
    const playerScore = {
        name: state.playerName,
        rollNo: state.playerRollNo,
        score: state.score,
        time: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage or sessionStorage (whichever works)
    try {
        let scores = JSON.parse(localStorage.getItem('sqlScores')) || [];
        scores.push(playerScore);
        localStorage.setItem('sqlScores', JSON.stringify(scores));
    } catch (e) {
        let scores = JSON.parse(sessionStorage.getItem('sqlScores')) || [];
        scores.push(playerScore);
        sessionStorage.setItem('sqlScores', JSON.stringify(scores));
    }

    // Send to server API
    fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: state.playerName,
            rollNo: state.playerRollNo,
            score: state.score,
            time: playerScore.time
        })
    }).catch(err => console.log('Score API response:', err));

    // Log player info
    console.log('✅ Player Score Saved:', playerScore);
}

function restartGame() {
    // Reset state
    state.timeRemaining = CONFIG.initialTime;
    state.score = 0;
    state.currentLevel = 1;
    state.playerName = '';
    state.playerRollNo = '';

    // Reset UI
    elements.topBar.classList.add('hidden');
    document.querySelector('.container').classList.remove('with-topbar');
    elements.countdownTimer.style.color = '';
    document.querySelector('.door-system').classList.remove('door-opening');
    document.getElementById('playerName').value = '';
    document.getElementById('playerRollNo').value = '';

    showScreen('doorScreen');
}

// ============================================
// UTILITIES
// ============================================
function showFeedback(msg, type) {
    elements.feedback.textContent = msg;
    elements.feedback.className = `feedback ${type}`;
}

function hideFeedback() {
    elements.feedback.className = 'feedback';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    cacheElements();
    setupEventListeners();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
