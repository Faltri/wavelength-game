import { useState, useCallback, useRef, useEffect } from 'react'
import {
    Target,
    Eye,
    EyeOff,
    ChevronRight,
    Sparkles,
    Zap,
    Trophy,
    AlertTriangle,
    Check,
    Lock,
    Play,
    Settings,
    RotateCcw,
    Waves,
    X,
    Home,
    Hand
} from 'lucide-react'

// ============================================================================
// CONTENT LIBRARY (20+ Pairs)
// ============================================================================

const STANDARD_PAIRS = [
    { left: 'Quiet', right: 'Loud' },
    { left: 'Useless', right: 'Essential' },
    { left: 'Basic', right: 'Avant-garde' },
    { left: 'Underrated', right: 'Overrated' },
    { left: 'Boring', right: 'Exciting' },
    { left: 'Cold', right: 'Hot' },
    { left: 'Old-fashioned', right: 'Futuristic' },
    { left: 'Cheap', right: 'Expensive' },
    { left: 'Easy', right: 'Difficult' },
    { left: 'Safe', right: 'Dangerous' },
    { left: 'Ugly', right: 'Beautiful' },
    { left: 'Weak', right: 'Powerful' },
    { left: 'Healthy', right: 'Unhealthy' },
    { left: 'Relaxing', right: 'Stressful' },
    { left: 'Natural', right: 'Artificial' },
    { left: 'Simple', right: 'Complex' },
    { left: 'Guilty pleasure', right: 'Genuine art' },
    { left: 'Introvert activity', right: 'Extrovert activity' },
    { left: 'Needs no skill', right: 'Requires mastery' },
    { left: 'Morning person', right: 'Night owl' },
    { left: 'Innocent', right: 'Unhinged' },
    { left: 'Forgettable', right: 'Iconic' },
    { left: 'Cringe', right: 'Based' },
    { left: 'Mainstream', right: 'Underground' },
]

const CHAOS_PAIRS = [
    { left: 'Acceptable at a funeral', right: 'Unacceptable at a funeral' },
    { left: 'Would tell my mom', right: 'Would never tell my mom' },
    { left: 'Cries easily about this', right: 'Stone cold about this' },
    { left: 'First date appropriate', right: 'Save for marriage' },
    { left: 'Makes you a hero', right: 'Makes you a villain' },
    { left: 'Sober activity', right: 'Requires liquid courage' },
    { left: 'Post on LinkedIn', right: 'Delete from existence' },
    { left: 'Bring to show & tell', right: 'Hide in a vault' },
    { left: 'Tell the cops', right: 'Plead the fifth' },
    { left: 'Humble brag', right: 'Actual embarrassment' },
    { left: 'Invite to brunch', right: 'Block on all platforms' },
    { left: 'Put on a resume', right: 'Take to the grave' },
    { left: 'Grandma approved', right: 'Grandma horrified' },
    { left: 'Disney movie worthy', right: 'Rated R minimum' },
    { left: 'Trust with my pet', right: "Wouldn't trust with a plant" },
    { left: 'Text back immediately', right: 'Leave on read forever' },
    { left: 'Normalize this', right: 'Cancel this' },
]

// ============================================================================
// GAME PHASES
// ============================================================================

const PHASES = {
    SETUP: 'setup',
    CLUE: 'clue',
    GUESS: 'guess',
    REVEAL: 'reveal',
}

// ============================================================================
// SCORING LOGIC
// ============================================================================

function calculateScore(targetValue, guessValue) {
    const distance = Math.abs(targetValue - guessValue)
    if (distance <= 5) return 4
    if (distance <= 10) return 3
    if (distance <= 15) return 2
    return 0
}

function getScoreMessage(score) {
    switch (score) {
        case 4: return 'PERFECT! 🎯'
        case 3: return 'EXCELLENT! 🔥'
        case 2: return 'CLOSE! 👍'
        default: return 'MISSED! 😅'
    }
}

function getScoreColor(score) {
    switch (score) {
        case 4: return 'text-emerald-400'
        case 3: return 'text-teal-400'
        case 2: return 'text-amber-400'
        default: return 'text-red-400'
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRandomPair(pairs, excludeIndex = -1) {
    let index
    do {
        index = Math.floor(Math.random() * pairs.length)
    } while (index === excludeIndex && pairs.length > 1)
    return { pair: pairs[index], index }
}

function getRandomTarget() {
    return Math.floor(Math.random() * 81) + 10
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Header with Navigation
function Header({ showQuit, onQuit, score, round }) {
    return (
        <header className="flex items-center justify-between w-full mb-6">
            {/* Left: Quit Button or Spacer */}
            <div className="w-11">
                {showQuit && (
                    <button
                        onClick={onQuit}
                        className="icon-button"
                        aria-label="Quit to menu"
                    >
                        <Home size={20} />
                    </button>
                )}
            </div>

            {/* Center: Score */}
            <div className="score-badge flex items-center gap-2">
                <Trophy size={18} />
                <span className="text-lg font-bold">{score}</span>
                <span className="text-xs opacity-60">pts</span>
            </div>

            {/* Right: Round */}
            <div className="w-11 text-right">
                <span className="text-xs text-gray-500 font-medium">R{round}</span>
            </div>
        </header>
    )
}

// Spectrum Component
function Spectrum({
    targetValue,
    guessValue,
    showTarget,
    showGuess,
    onGuessChange,
    interactive = false
}) {
    const spectrumRef = useRef(null)
    const isDragging = useRef(false)

    const handleInteraction = useCallback((clientX) => {
        if (!spectrumRef.current || !interactive) return

        const rect = spectrumRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        onGuessChange?.(percentage)
    }, [interactive, onGuessChange])

    const handleMouseDown = (e) => {
        if (!interactive) return
        isDragging.current = true
        handleInteraction(e.clientX)
    }

    const handleMouseMove = (e) => {
        if (!isDragging.current || !interactive) return
        handleInteraction(e.clientX)
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleTouchStart = (e) => {
        if (!interactive) return
        isDragging.current = true
        handleInteraction(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
        if (!isDragging.current || !interactive) return
        e.preventDefault()
        handleInteraction(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
        isDragging.current = false
    }

    useEffect(() => {
        if (!interactive) return

        const handleGlobalMouseUp = () => {
            isDragging.current = false
        }

        const handleGlobalMouseMove = (e) => {
            if (isDragging.current) {
                handleInteraction(e.clientX)
            }
        }

        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('mousemove', handleGlobalMouseMove)

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [interactive, handleInteraction])

    return (
        <div className="spectrum-container">
            <div
                ref={spectrumRef}
                className="spectrum-bar"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: interactive ? 'none' : 'auto' }}
            >
                {/* Target Needle */}
                {showTarget && (
                    <div
                        className="needle needle-target animate-fade-in"
                        style={{ left: `${targetValue}%` }}
                    >
                        <div className="needle-indicator animate-pulse-glow" />
                        <span className="needle-label">Target</span>
                    </div>
                )}

                {/* Guess Needle */}
                {showGuess && (
                    <div
                        className={`needle needle-guess ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        style={{ left: `${guessValue}%` }}
                    >
                        <div className="needle-indicator" />
                        <span className="needle-label">Guess</span>
                    </div>
                )}

                {/* Interactive touch area */}
                {interactive && <div className="touch-area" />}
            </div>
        </div>
    )
}

// Labels Component
function SpectrumLabels({ left, right }) {
    return (
        <div className="spectrum-labels">
            <span className="spectrum-label spectrum-label-left">{left}</span>
            <span className="spectrum-label spectrum-label-right">{right}</span>
        </div>
    )
}

// Score Display for Reveal
function RevealScore({ roundScore }) {
    return (
        <div className="flex items-center justify-center gap-3 my-4">
            <div className={`text-4xl font-bold animate-score-pop ${getScoreColor(roundScore)}`}>
                +{roundScore}
            </div>
        </div>
    )
}

// Pass Device Warning
function PassDeviceWarning({ targetRole, onContinue }) {
    return (
        <div className="warning-overlay">
            <div className="glass-card p-8 max-w-sm w-full text-center animate-scale-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center animate-float">
                    <Hand size={40} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                    Pass the Device
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    {targetRole === 'giver'
                        ? 'Hand the device to the Clue Giver. They will see where the target is.'
                        : "Hand the device to the Guessers. Make sure they didn't see the target!"}
                </p>
                <button
                    onClick={onContinue}
                    className="glass-button btn-primary w-full py-4 rounded-2xl text-lg font-semibold"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Eye size={20} />
                        I'm the {targetRole === 'giver' ? 'Clue Giver' : 'Guesser'}
                    </span>
                </button>
            </div>
        </div>
    )
}

// Custom Pair Input
function CustomPairInput({ onSubmit, onCancel }) {
    const [left, setLeft] = useState('')
    const [right, setRight] = useState('')

    const handleSubmit = () => {
        if (left.trim() && right.trim()) {
            onSubmit({ left: left.trim(), right: right.trim() })
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Custom Spectrum</h3>
                <p className="text-sm text-gray-400">Create your own opposite pair</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">Left Side (0%)</label>
                    <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g., Innocent"
                        value={left}
                        onChange={(e) => setLeft(e.target.value)}
                        maxLength={30}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">Right Side (100%)</label>
                    <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g., Unhinged"
                        value={right}
                        onChange={(e) => setRight(e.target.value)}
                        maxLength={30}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="glass-button flex-1 py-4 rounded-2xl font-semibold"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!left.trim() || !right.trim()}
                    className="glass-button btn-primary flex-1 py-4 rounded-2xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Play size={18} />
                        Start
                    </span>
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

function WavelengthGame() {
    // Game State
    const [phase, setPhase] = useState(PHASES.SETUP)
    const [leftLabel, setLeftLabel] = useState('')
    const [rightLabel, setRightLabel] = useState('')
    const [targetValue, setTargetValue] = useState(50)
    const [guessValue, setGuessValue] = useState(50)
    const [totalScore, setTotalScore] = useState(0)
    const [roundScore, setRoundScore] = useState(null)
    const [chaosMode, setChaosMode] = useState(false)
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [showPassWarning, setShowPassWarning] = useState(false)
    const [warningTarget, setWarningTarget] = useState('giver')
    const [lastPairIndex, setLastPairIndex] = useState(-1)
    const [round, setRound] = useState(1)

    const activePairs = chaosMode ? CHAOS_PAIRS : STANDARD_PAIRS

    // Start a new round
    const startNewRound = useCallback((customPair = null) => {
        if (customPair) {
            setLeftLabel(customPair.left)
            setRightLabel(customPair.right)
        } else {
            const { pair, index } = getRandomPair(activePairs, lastPairIndex)
            setLeftLabel(pair.left)
            setRightLabel(pair.right)
            setLastPairIndex(index)
        }
        setTargetValue(getRandomTarget())
        setGuessValue(50)
        setRoundScore(null)
        setShowCustomInput(false)
        setWarningTarget('giver')
        setShowPassWarning(true)
    }, [activePairs, lastPairIndex])

    // Handle pass device confirmation
    const handlePassDeviceConfirm = () => {
        setShowPassWarning(false)
        if (warningTarget === 'giver') {
            setPhase(PHASES.CLUE)
        } else {
            setPhase(PHASES.GUESS)
        }
    }

    // Handle clue given
    const handleClueGiven = () => {
        setWarningTarget('guesser')
        setShowPassWarning(true)
    }

    // Handle guess locked
    const handleLockGuess = () => {
        const score = calculateScore(targetValue, guessValue)
        setRoundScore(score)
        setTotalScore(prev => prev + score)
        setPhase(PHASES.REVEAL)
    }

    // Handle next round
    const handleNextRound = () => {
        setRound(prev => prev + 1)
        setPhase(PHASES.SETUP)
    }

    // Handle game reset / quit
    const handleQuitGame = () => {
        setPhase(PHASES.SETUP)
        setShowCustomInput(false)
    }

    const handleResetGame = () => {
        setPhase(PHASES.SETUP)
        setTotalScore(0)
        setRound(1)
        setRoundScore(null)
        setLastPairIndex(-1)
        setShowCustomInput(false)
    }

    // Handle custom pair
    const handleCustomPair = (pair) => {
        startNewRound(pair)
    }

    // ========== RENDER PHASES ==========

    // Setup Phase
    const renderSetup = () => (
        <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-3 mb-3">
                    <Waves size={36} className="text-teal-400" />
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Wavelength
                    </h1>
                </div>
                <p className="text-gray-400 text-sm">
                    Find the hidden target on the spectrum
                </p>
            </div>

            {showCustomInput ? (
                <div className="w-full">
                    <CustomPairInput
                        onSubmit={handleCustomPair}
                        onCancel={() => setShowCustomInput(false)}
                    />
                </div>
            ) : (
                <>
                    {/* Chaos Mode Toggle */}
                    <div className="glass-panel p-5 w-full flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-left">
                            <Zap size={22} className={chaosMode ? 'text-purple-400' : 'text-gray-500'} />
                            <div>
                                <h3 className="font-semibold text-sm">Chaos Mode</h3>
                                <p className="text-xs text-gray-500">Spicier prompts 🌶️</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChaosMode(!chaosMode)}
                            className={`toggle-switch ${chaosMode ? 'active' : ''}`}
                            aria-label="Toggle Chaos Mode"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-3">
                        <button
                            onClick={() => startNewRound()}
                            className="glass-button btn-primary w-full py-5 rounded-2xl text-lg font-bold"
                        >
                            <span className="flex items-center justify-center gap-3">
                                <Play size={24} />
                                Start Round
                            </span>
                        </button>

                        <button
                            onClick={() => setShowCustomInput(true)}
                            className="glass-button btn-secondary w-full py-4 rounded-2xl font-semibold"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Settings size={20} />
                                Custom Spectrum
                            </span>
                        </button>

                        {totalScore > 0 && (
                            <button
                                onClick={handleResetGame}
                                className="glass-button w-full py-3 rounded-xl mt-4"
                            >
                                <span className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                    <RotateCcw size={16} />
                                    Reset Score
                                </span>
                            </button>
                        )}
                    </div>

                    {/* How to Play */}
                    <div className="glass-panel p-5 w-full mt-8 text-left">
                        <h4 className="font-semibold text-sm mb-3 text-gray-300">How to Play</h4>
                        <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                            <li><span className="text-teal-400 font-medium">Clue Giver</span> sees the target location</li>
                            <li>They give a one-word clue about where it falls</li>
                            <li><span className="text-orange-400 font-medium">Guessers</span> drag the marker to guess</li>
                            <li>Score points based on accuracy!</li>
                        </ol>
                    </div>
                </>
            )}
        </div>
    )

    // Clue Phase
    const renderClue = () => (
        <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Phase Badge */}
            <div className="phase-badge phase-badge-clue mb-4">
                <Eye size={18} />
                <span>Clue Giver's View</span>
            </div>

            <h2 className="text-2xl font-bold mb-2">Give a Clue!</h2>
            <p className="text-gray-400 text-sm mb-8">
                The target is shown below. Give a verbal clue!
            </p>

            {/* Spectrum */}
            <div className="glass-panel p-6 w-full mb-8">
                <Spectrum
                    targetValue={targetValue}
                    guessValue={guessValue}
                    showTarget={true}
                    showGuess={false}
                    interactive={false}
                />
                <SpectrumLabels left={leftLabel} right={rightLabel} />
            </div>

            {/* Action Button */}
            <button
                onClick={handleClueGiven}
                className="glass-button btn-coral w-full py-5 rounded-2xl text-lg font-bold"
            >
                <span className="flex items-center justify-center gap-3">
                    <Check size={24} />
                    I've Given My Clue
                </span>
            </button>

            {/* Privacy Reminder */}
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                <EyeOff size={12} />
                Don't let the guessers see the screen!
            </p>
        </div>
    )

    // Guess Phase
    const renderGuess = () => (
        <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Phase Badge */}
            <div className="phase-badge phase-badge-guess mb-4">
                <Target size={18} />
                <span>Guesser's Turn</span>
            </div>

            <h2 className="text-2xl font-bold mb-2">Make Your Guess!</h2>
            <p className="text-gray-400 text-sm mb-8">
                Drag the marker to where you think the target is
            </p>

            {/* Spectrum */}
            <div className="glass-panel p-6 w-full mb-8">
                <Spectrum
                    targetValue={targetValue}
                    guessValue={guessValue}
                    showTarget={false}
                    showGuess={true}
                    onGuessChange={setGuessValue}
                    interactive={true}
                />
                <SpectrumLabels left={leftLabel} right={rightLabel} />
            </div>

            {/* Action Button */}
            <button
                onClick={handleLockGuess}
                className="glass-button btn-primary w-full py-5 rounded-2xl text-lg font-bold"
            >
                <span className="flex items-center justify-center gap-3">
                    <Lock size={24} />
                    Lock In Guess
                </span>
            </button>

            {/* Hint */}
            <p className="text-xs text-gray-500 mt-4">
                Tap or drag on the spectrum to move your guess
            </p>
        </div>
    )

    // Reveal Phase
    const renderReveal = () => (
        <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Phase Badge */}
            <div className="phase-badge phase-badge-reveal mb-4">
                <Sparkles size={18} />
                <span>Reveal</span>
            </div>

            {/* Score Message */}
            <h2 className={`text-3xl font-bold mb-2 ${getScoreColor(roundScore)}`}>
                {getScoreMessage(roundScore)}
            </h2>

            <RevealScore roundScore={roundScore} />

            {/* Spectrum */}
            <div className="glass-panel p-6 w-full mb-6">
                <Spectrum
                    targetValue={targetValue}
                    guessValue={guessValue}
                    showTarget={true}
                    showGuess={true}
                    interactive={false}
                />
                <SpectrumLabels left={leftLabel} right={rightLabel} />
            </div>

            {/* Distance Info */}
            <div className="glass-panel px-5 py-3 mb-8 inline-flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                    Distance: <span className="text-white font-bold">{Math.abs(Math.round(targetValue - guessValue))}</span>
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500 text-xs">
                    ≤5=4pts • ≤10=3pts • ≤15=2pts
                </span>
            </div>

            {/* Action Button */}
            <button
                onClick={handleNextRound}
                className="glass-button btn-secondary w-full py-5 rounded-2xl text-lg font-bold"
            >
                <span className="flex items-center justify-center gap-3">
                    Next Round
                    <ChevronRight size={24} />
                </span>
            </button>
        </div>
    )

    // ========== MAIN RENDER ==========

    return (
        <div className="w-full max-w-md mx-auto px-4 py-6 md:py-10">
            {/* Pass Device Warning Overlay */}
            {showPassWarning && (
                <PassDeviceWarning
                    targetRole={warningTarget}
                    onContinue={handlePassDeviceConfirm}
                />
            )}

            {/* Main Card */}
            <div className="glass-card px-6 py-8 md:px-8 md:py-10">
                {/* Header with Navigation */}
                <Header
                    showQuit={phase !== PHASES.SETUP}
                    onQuit={handleQuitGame}
                    score={totalScore}
                    round={round}
                />

                {/* Phase Content */}
                <main>
                    {phase === PHASES.SETUP && renderSetup()}
                    {phase === PHASES.CLUE && renderClue()}
                    {phase === PHASES.GUESS && renderGuess()}
                    {phase === PHASES.REVEAL && renderReveal()}
                </main>
            </div>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-600 mt-6">
                Wavelength Party Game • Made with 💜
            </footer>
        </div>
    )
}

export default WavelengthGame
