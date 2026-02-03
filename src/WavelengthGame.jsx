import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
    Hand,
    Plus,
    Clock
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
// THEMES & CONFIG
// ============================================================================

const THEMES = {
    DARK: {
        id: 'dark',
        name: 'Cyber Noir',
        bg: 'bg-slate-950',
        text: 'text-white',
        panel: 'bg-zinc-900/90',
        accent: 'text-cyan-400',
        subtext: 'text-gray-400',
        border: 'border-white/5',
        passWarningBg: 'bg-black/95',
    },
    LIGHT: {
        id: 'light',
        name: 'Polar Day',
        bg: 'bg-slate-100',
        text: 'text-slate-900',
        panel: 'bg-white/90',
        accent: 'text-cyan-600',
        subtext: 'text-slate-500',
        border: 'border-black/5',
        passWarningBg: 'bg-white/95',
    }
}

// ============================================================================
// GAME PHASES
// ============================================================================

const PHASES = {
    SETUP: 'setup',
    CLUE: 'clue',
    GUESS: 'guess',
    REVEAL: 'reveal',
    SETTINGS: 'settings',
    PLAYER_SETUP: 'player_setup',
}

// ============================================================================
// SCORING LOGIC
// ============================================================================

function calculateScore(targetValue, guessValue) {
    const distance = Math.abs(targetValue - guessValue)
    if (distance <= 4) return 4
    if (distance <= 8) return 3
    if (distance <= 12) return 2
    return 0
}

function getScoreMessage(score) {
    switch (score) {
        case 4: return 'PERFECT SYNC! 💎'
        case 3: return 'EXCELLENT! 🔥'
        case 2: return 'CLOSE! ⚡'
        default: return 'MISSED! 💀'
    }
}

function getScoreColor(score) {
    switch (score) {
        case 4: return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
        case 3: return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]'
        case 2: return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'
        default: return 'text-red-500'
    }
}

// ============================================================================
// AUDIO HOOK (Synthesized SFX)
// ============================================================================

const useAudioSynthesis = (enabled = true) => {
    const playTone = useCallback((freq, type, duration, vol = 0.1) => {
        if (!enabled) return
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (!AudioContext) return
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = type
            osc.frequency.setValueAtTime(freq, ctx.currentTime)

            gain.gain.setValueAtTime(vol, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start()
            osc.stop(ctx.currentTime + duration)
        } catch (e) {
            console.error("Audio Error:", e)
        }
    }, [enabled])

    const playClick = useCallback(() => playTone(800, 'sine', 0.05, 0.05), [playTone])
    const playTick = useCallback(() => playTone(1200, 'triangle', 0.03, 0.02), [playTone])
    const playSuccess = useCallback(() => {
        if (!enabled) return
        playTone(440, 'sine', 0.1, 0.1)
        setTimeout(() => playTone(554, 'sine', 0.1, 0.1), 100)
        setTimeout(() => playTone(659, 'sine', 0.2, 0.1), 200)
    }, [playTone, enabled])

    return { playClick, playTick, playSuccess }
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
    // Keep target away from absolute edges for better gameplay (10-90)
    return Math.floor(Math.random() * 81) + 10
}

// ============================================================================
// SVG DIAL COMPONENTS
// ============================================================================

// Helper to calculate point on circle
const getCoordinatesForPercent = (percent, radius = 90, center = { x: 100, y: 100 }) => {
    // defined: 0% = 180deg (Left), 50% = 270deg (Top), 100% = 360deg (Right)
    const angleRad = (180 + (percent / 100) * 180) * (Math.PI / 180);
    const x = center.x + radius * Math.cos(angleRad);
    const y = center.y + radius * Math.sin(angleRad);
    return { x, y };
}

function DialSpectrum({
    targetValue,
    guessValue,
    showTarget,
    showGuess,
    onGuessChange,
    interactive = false,
    leftLabel,
    rightLabel,
    theme = null
}) {
    const svgRef = useRef(null)
    const isDragging = useRef(false)

    // Theme-based colors (light mode = beige like real Wavelength board game)
    const isLight = theme?.id === 'light'
    const colors = {
        // Device housing
        housingStroke: isLight ? '#a3a3a3' : '#475569',
        // Screen/dial background
        screenFill1: isLight ? '#f5f0e6' : '#1e293b',  // Beige for light
        screenFill2: isLight ? '#e8dcc8' : '#0f172a',  // Darker beige edge
        screenStroke: isLight ? '#d4c4a8' : '#334155',
        // Body gradient
        bodyLight: isLight ? '#e5e5e5' : '#334155',
        bodyDark: isLight ? '#a3a3a3' : '#0f172a',
        // Tick marks
        tickColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
        // Hub cover
        hubFill: isLight ? '#d4c4a8' : '#1e293b',
        hubStroke: isLight ? '#b8a88a' : '#334155',
        // Labels
        labelBg: isLight ? 'rgba(245,240,230,0.95)' : 'rgba(30,41,59,0.95)',
        labelBorder: isLight ? 'rgba(180,160,130,0.5)' : 'rgba(255,255,255,0.1)',
        labelText: isLight ? '#44403c' : 'white',
    }

    // Interaction Logic (Touch & Mouse) - Kept robust
    const handleInteraction = useCallback((clientX, clientY) => {
        if (!svgRef.current || !interactive) return

        const rect = svgRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        // Center Y is roughly the bottom of the viewBox.
        // ViewBox is 0 0 200 110. Center is at (100, 100).
        // Ratio: 100/110 = 0.909.
        const centerY = rect.top + (rect.height * (100 / 110))

        const dx = clientX - centerX
        const dy = clientY - centerY
        let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)

        let percentage = 0
        if (angleDeg >= 0 && angleDeg <= 180) {
            angleDeg < 90 ? percentage = 100 : percentage = 0
        } else {
            percentage = (angleDeg + 180) / 1.8
        }
        percentage = Math.max(0, Math.min(100, percentage))
        onGuessChange?.(percentage)
    }, [interactive, onGuessChange])

    const handleStart = (e) => {
        if (!interactive) return
        isDragging.current = true
        const pt = e.touches ? e.touches[0] : e
        handleInteraction(pt.clientX, pt.clientY)
    }

    const handleMove = (e) => {
        if (!isDragging.current || !interactive) return
        if (e.touches) e.preventDefault()
        const pt = e.touches ? e.touches[0] : e
        handleInteraction(pt.clientX, pt.clientY)
    }

    const handleEnd = () => (isDragging.current = false)

    useEffect(() => {
        if (!interactive) return
        window.addEventListener('mouseup', handleEnd)
        window.addEventListener('touchend', handleEnd)
        return () => {
            window.removeEventListener('mouseup', handleEnd)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [interactive])

    // Coords
    const center = { x: 100, y: 100 }
    const radius = 90

    // Wedge Generator
    const createWedge = (val, widthPercent, color) => {
        const start = getCoordinatesForPercent(Math.max(0, val - widthPercent), radius, center)
        const end = getCoordinatesForPercent(Math.min(100, val + widthPercent), radius, center)
        return (
            <path
                d={`M ${center.x} ${center.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`}
                fill={color}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="0.5"
            />
        )
    }

    const guessCoords = getCoordinatesForPercent(guessValue, radius, center)

    return (
        <div className="w-full flex flex-col items-center justify-center relative">
            {/* The Physical Device Body */}
            <div className="relative w-full aspect-[2/1.05]">
                <svg
                    ref={svgRef}
                    viewBox="0 0 200 110"
                    className={`w-full h-full drop-shadow-2xl ${interactive ? 'cursor-pointer touch-none' : ''}`}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                >
                    <defs>
                        {/* Physical Plastic Body Gradient */}
                        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={colors.bodyLight} />
                            <stop offset="100%" stopColor={colors.bodyDark} />
                        </linearGradient>

                        {/* Shutter / Screen Gradient */}
                        <radialGradient id="screenGradient" cx="50%" cy="100%" r="90%">
                            <stop offset="50%" stopColor={colors.screenFill1} />
                            <stop offset="100%" stopColor={colors.screenFill2} />
                        </radialGradient>

                        {/* Drop Shadow for Needle */}
                        <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                            <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                            <feMerge>
                                <feMergeNode in="offsetBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. Device Housing (Outer Rim) */}
                    <path
                        d="M 5 100 A 95 95 0 0 1 195 100"
                        fill="none"
                        stroke={colors.housingStroke}
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="drop-shadow-lg"
                    />

                    {/* 2. The Screen / Background Area */}
                    <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="url(#screenGradient)"
                        stroke={colors.screenStroke}
                        strokeWidth="1"
                    />

                    {/* 3. Tick Marks (Subtle grid) */}
                    {Array.from({ length: 9 }).map((_, i) => {
                        const pct = (i + 1) * 10
                        if (pct >= 100) return null
                        const p1 = getCoordinatesForPercent(pct, 88, center)
                        const p2 = getCoordinatesForPercent(pct, 82, center)
                        return (
                            <line
                                key={i}
                                x1={p1.x} y1={p1.y}
                                x2={p2.x} y2={p2.y}
                                stroke={colors.tickColor}
                                strokeWidth="0.5"
                            />
                        )
                    })}

                    {/* 4. Target Wedges (The "Shutter" Reveal) */}
                    {showTarget && (
                        <g className="animate-reveal-shutter filter drop-shadow-lg">
                            {/* 2pts (Left/Right) - Yellow */}
                            {createWedge(targetValue - 10, 4, "#fbbf24")}
                            {createWedge(targetValue + 10, 4, "#fbbf24")}

                            {/* 3pts - Purple */}
                            {createWedge(targetValue - 6, 4, "#c084fc")}
                            {createWedge(targetValue + 6, 4, "#c084fc")}

                            {/* 4pts - Cyan/Blue */}
                            {createWedge(targetValue, 2, "#22d3ee")}
                        </g>
                    )}

                    {/* 5. Central Hub Cover (Plastic matte finish) */}
                    <path
                        d="M 70 105 A 30 30 0 0 1 130 105"
                        fill={colors.hubFill}
                        stroke={colors.hubStroke}
                        strokeWidth="1"
                    />

                    {/* 6. The Physical Needle */}
                    {showGuess && (
                        <g
                            className={`${interactive ? 'cursor-grab active:cursor-grabbing' : ''} transition-transform duration-75 ease-out`}
                            style={{ filter: 'url(#needleShadow)' }}
                        >
                            {/* The Arm */}
                            <line
                                x1={center.x} y1={center.y}
                                x2={guessCoords.x} y2={guessCoords.y}
                                stroke="#ef4444"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />

                            {/* The Hub Cap (Top of arm pivot) */}
                            <circle
                                cx={center.x}
                                cy={center.y}
                                r="4"
                                fill="#b91c1c" /* Darker red center */
                                stroke="#ef4444"
                                strokeWidth="2"
                            />
                        </g>
                    )}
                </svg>

            </div>

            {/* Labels Dock - Positioned Relative Below */}
            <div className="flex justify-between w-full px-2 mt-2 z-10 box-border">
                <span className={`text-xl font-bold drop-shadow-md text-left leading-tight break-words max-w-[45%] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                    {leftLabel}
                </span>
                <span className={`text-xl font-bold drop-shadow-md text-right leading-tight break-words max-w-[45%] ${isLight ? 'text-amber-700' : 'text-yellow-300'}`}>
                    {rightLabel}
                </span>
            </div>
        </div>
    )
}



// ============================================================================
// COMPONENTS
// ============================================================================

// Header with Navigation
function Header({ showQuit, onQuit, teams, currentTurnIndex, enableTeams, totalScore, theme }) {
    const currentTeam = teams[currentTurnIndex]
    const panelClass = theme ? theme.panel : 'bg-slate-800/80'
    const textClass = theme ? theme.text : 'text-white'
    const subtextClass = theme ? theme.subtext : 'text-gray-400'
    const borderClass = theme ? theme.border : 'border-white/10'

    return (
        <header className="absolute top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between">
            {/* Left: Navigation/Quit */}
            <div className="flex-1 flex justify-start">
                {showQuit && (
                    <button
                        onClick={onQuit}
                        className={`flex items-center gap-2 ${subtextClass} hover:${textClass} transition-colors`}
                        aria-label="Back to menu"
                    >
                        <Home size={28} />
                    </button>
                )}
            </div>

            {/* Center: Turn Info */}
            <div className="flex-1 flex flex-col items-center">
                {showQuit && (enableTeams ? (
                    <div className={`${panelClass} px-4 py-2 rounded-full border ${borderClass} backdrop-blur`}>
                        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold block text-center">Turn</span>
                        <span className={`text-lg font-black ${textClass} block text-center leading-none mt-1`}>{currentTeam.name}</span>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className={`text-xs font-bold ${subtextClass} tracking-[0.2em] uppercase`}>Co-op</span>
                    </div>
                ))}
            </div>

            {/* Right: Score Display */}
            <div className="flex-1 flex justify-end">
                {enableTeams ? (
                    <div className="flex gap-2">
                        {teams.map(t => (
                            <div key={t.id} className={`flex flex-col items-center px-3 py-1 rounded-lg ${t === currentTeam ? 'bg-white/10' : 'opacity-50'}`}>
                                <span className={`text-[10px] font-bold ${subtextClass}`}>{t.name}</span>
                                <span className={`text-xl font-black ${textClass}`}>{t.score}</span>
                            </div>
                        ))}
                    </div>
                ) : (showQuit && (
                    <div className={`flex items-center gap-2 ${panelClass} px-4 py-2 rounded-full border ${borderClass}`}>
                        <Trophy size={16} className="text-yellow-400" />
                        <span className={`text-xl font-black ${textClass}`}>{totalScore}</span>
                    </div>
                ))}
            </div>
        </header>
    )
}

// Score Display for Reveal
function RevealScore({ roundScore }) {
    return (
        <div className="flex items-center justify-center gap-3 my-4">
            <div className={`text-6xl font-black italic tracking-tighter animate-score-pop ${getScoreColor(roundScore)}`}>
                +{roundScore}
            </div>
        </div>
    )
}

// Pass Device Warning
function PassDeviceWarning({ targetRole, onContinue, teamName, theme }) {
    const isLight = theme?.id === 'light'

    return (
        <div className={`warning-overlay backdrop-blur-md ${isLight ? 'bg-white/90' : 'bg-black/90'}`}>
            <div className={`p-10 max-w-sm w-full text-center animate-scale-in rounded-3xl border shadow-2xl ${isLight ? 'bg-slate-100 border-amber-400/50' : 'glass-card border-yellow-500/30'}`}>
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-float border shadow-lg ${isLight ? 'bg-amber-100 border-amber-400/50' : 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]'}`}>
                    <Hand size={40} className={isLight ? 'text-amber-600' : 'text-yellow-400'} />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {teamName}
                </h2>
                <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                    Pass the Device
                </h3>
                <p className={`mb-8 leading-relaxed font-medium text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                    {targetRole === 'giver'
                        ? 'Hand the device to the Clue Giver. They will see where the target is.'
                        : "Hand the device to the Guessers. Make sure they didn't see the target!"}
                </p>
                <button
                    onClick={onContinue}
                    className={`w-full py-4 rounded-2xl text-lg font-bold transition-all active:scale-95 ${isLight ? 'bg-amber-500 text-white hover:bg-amber-600' : 'glass-button btn-primary text-black'}`}
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
function CustomPairInput({ onSubmit, onCancel, history = [] }) {
    const [left, setLeft] = useState('')
    const [right, setRight] = useState('')

    const handleSubmit = () => {
        if (left.trim() && right.trim()) {
            onSubmit({ left: left.trim(), right: right.trim() })
        }
    }

    const handleSuggestion = () => {
        const randomPair = STANDARD_PAIRS[Math.floor(Math.random() * STANDARD_PAIRS.length)]
        setLeft(randomPair.left)
        setRight(randomPair.right)
    }

    return (
        <div className="space-y-6 animate-fade-in w-full">
            <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-white">Custom Spectrum</h3>
                <p className="text-sm text-gray-400">Create your own opposite pair</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block font-bold">Left Side (0%)</label>
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
                    <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block font-bold">Right Side (100%)</label>
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

            <button
                onClick={handleSuggestion}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest w-full text-center py-2"
            >
                <Sparkles size={12} className="inline mr-1" />
                Get Suggestion
            </button>

            {history.length > 0 && (
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Recent</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {history.slice(0, 3).map((h, i) => (
                            <button
                                key={i}
                                onClick={() => { setLeft(h.left); setRight(h.right); }}
                                className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/5 truncate max-w-[150px]"
                            >
                                {h.left} / {h.right}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="glass-button flex-1 py-4 rounded-2xl font-semibold opacity-70 hover:opacity-100"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!left.trim() || !right.trim()}
                    className="glass-button btn-primary flex-1 py-4 rounded-2xl font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
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
    const [teams, setTeams] = useState([
        { id: 1, name: 'Team 1', score: 0 },
        { id: 2, name: 'Team 2', score: 0 }
    ])
    const [players, setPlayers] = useState([
        { id: 1, name: 'Player 1', score: 0 },
        { id: 2, name: 'Player 2', score: 0 }
    ])
    const [enableTeams, setEnableTeams] = useState(false)
    const [oneVsOneMode, setOneVsOneMode] = useState(false) // 1v1 competitive mode
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
    const [currentTheme, setCurrentTheme] = useState(THEMES.DARK)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const { playClick, playTick, playSuccess } = useAudioSynthesis(soundEnabled)

    // Round State
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

    // Interactive Features
    const [timerDuration, setTimerDuration] = useState(60) // Seconds
    const [timeLeft, setTimeLeft] = useState(null)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [promptHistory, setPromptHistory] = useState([])

    // Current player for turn display
    const currentPlayer = players[currentPlayerIndex] || players[0]

    // Check if 1v1 mode is available (exactly 2 players)
    const canEnable1v1 = players.length === 2


    const activePairs = chaosMode ? CHAOS_PAIRS : STANDARD_PAIRS

    // --- EFFECTS ---

    // Timer Logic
    useEffect(() => {
        let interval
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false)
                        // Time's up - calculate and reveal
                        const score = calculateScore(targetValue, guessValue)
                        setRoundScore(score)
                        setTotalScore(ts => ts + score)
                        if (enableTeams) {
                            setTeams(t => t.map((team, idx) =>
                                idx === currentTurnIndex ? { ...team, score: team.score + score } : team
                            ))
                        }
                        setPhase(PHASES.REVEAL)
                        return 0
                    }
                    if (prev <= 5) playTick()
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, timeLeft, playTick, targetValue, guessValue, enableTeams, currentTurnIndex])

    // Sound wrapper for Dial
    const handleGuessChange = useCallback((val) => {
        setGuessValue((prev) => {
            if (Math.floor(prev / 5) !== Math.floor(val / 5)) playTick()
            return val
        })
    }, [playTick])

    // --- GAME ACTIONS ---

    // Team management
    const addTeam = () => {
        if (teams.length < 4) {
            setTeams(prev => [
                ...prev,
                { id: Date.now(), name: `Team ${prev.length + 1}`, score: 0 }
            ])
        }
    }

    const removeTeam = (id) => {
        if (teams.length > 2) {
            setTeams(prev => prev.filter(t => t.id !== id))
        }
    }

    const updateTeamName = (id, newName) => {
        setTeams(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t))
    }

    // Player management
    const addPlayer = () => {
        if (players.length < 8) {
            setPlayers(prev => [
                ...prev,
                { id: Date.now(), name: `Player ${prev.length + 1}`, score: 0 }
            ])
            // Disable 1v1 mode when more than 2 players
            if (players.length >= 2) {
                setOneVsOneMode(false)
            }
        }
    }

    const removePlayer = (id) => {
        if (players.length > 2) {
            setPlayers(prev => prev.filter(p => p.id !== id))
        }
    }

    const updatePlayerName = (id, newName) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p))
    }

    // Start a new round
    const startNewRound = useCallback((customPair = null) => {
        playClick()

        // History
        if (leftLabel && rightLabel) {
            setPromptHistory(prev => [{
                left: leftLabel,
                right: rightLabel,
                target: targetValue,
                score: roundScore
            }, ...prev].slice(0, 10))
        }

        if (customPair) {
            setLeftLabel(customPair.left)
            setRightLabel(customPair.right)
        } else {
            const { pair, index } = getRandomPair(activePairs, lastPairIndex)
            setLeftLabel(pair.left)
            setRightLabel(pair.right)
            setLastPairIndex(index)
        }

        // Note: Player rotation happens in handleNextRound, not here
        // This ensures the Clue Giver gets credit for the current round

        setTargetValue(getRandomTarget())
        setGuessValue(50)
        setRoundScore(null)
        setShowCustomInput(false)
        setWarningTarget('giver')
        setShowPassWarning(true)

        // Reset Timer
        setTimeLeft(timerDuration)
        setIsTimerRunning(false)

        setPhase(PHASES.CLUE)
    }, [activePairs, lastPairIndex, leftLabel, rightLabel, timerDuration, playClick, roundScore, targetValue])

    // Handle pass device confirmation
    const handlePassDeviceConfirm = () => {
        playClick()
        setShowPassWarning(false)
        if (warningTarget === 'giver') {
            setPhase(PHASES.CLUE)
        } else {
            setPhase(PHASES.GUESS)
            if (timerDuration > 0) {
                setTimeLeft(timerDuration)
                setIsTimerRunning(true)
            }
        }
    }

    // Handle clue given
    const handleClueGiven = () => {
        setWarningTarget('guesser')
        setShowPassWarning(true)
    }

    // Handle guess locked
    const handleLockGuess = () => {
        playClick()
        setIsTimerRunning(false)
        const score = calculateScore(targetValue, guessValue)
        setRoundScore(score)

        if (score >= 3) playSuccess()

        // Update score
        setTotalScore(prev => prev + score) // Always update total for simplicity

        // 1v1 mode - update player scores
        if (oneVsOneMode && canEnable1v1) {
            setPlayers(prev => prev.map((player, idx) =>
                idx === currentPlayerIndex ? { ...player, score: player.score + score } : player
            ))
        }

        if (enableTeams) {
            setTeams(prev => prev.map((team, idx) =>
                idx === currentTurnIndex ? { ...team, score: team.score + score } : team
            ))
        }

        setPhase(PHASES.REVEAL)
    }

    const handleNextRound = () => {
        playClick()

        // Rotate to next player AFTER seeing the score
        const nextPlayer = (currentPlayerIndex + 1) % players.length
        setCurrentPlayerIndex(nextPlayer)

        // Team turn (if teams enabled)
        if (enableTeams) {
            const nextTurn = (currentTurnIndex + 1) % teams.length
            setCurrentTurnIndex(nextTurn)
        }

        startNewRound()
    }

    // Handle game reset / quit
    const handleQuitGame = () => {
        setPhase(PHASES.SETUP)
        setShowCustomInput(false)
    }

    const handleResetGame = () => {
        setPhase(PHASES.SETUP)
        setTeams(prev => prev.map(t => ({ ...t, score: 0 })))
        setCurrentTurnIndex(0)
        setRoundScore(null)
        setLastPairIndex(-1)
        setShowCustomInput(false)
        setTotalScore(0)
    }

    // Handle custom pair
    const handleCustomPair = (pair) => {
        startNewRound(pair)
    }

    // --- RENDER PHASES ---

    const renderSettings = () => (
        <div className="flex flex-col items-center w-full px-6 pt-8 text-center animate-fade-in">
            <h2 className={`text-3xl font-black uppercase tracking-tight mb-8 ${currentTheme.text}`}>Advanced Settings</h2>

            <div className={`w-full max-w-sm space-y-4 ${currentTheme.text}`}>
                {/* Theme Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-2xl ${currentTheme.passWarningBg.replace('95', '10')} border ${currentTheme.border}`}>
                    <div className="text-left">
                        <h3 className="font-bold text-lg">Visual Theme</h3>
                        <p className={`text-xs font-medium ${currentTheme.subtext}`}>
                            {currentTheme.id === 'dark' ? 'Cyber Noir' : 'Polar Day'}
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentTheme(currentTheme.id === 'dark' ? THEMES.LIGHT : THEMES.DARK)}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${currentTheme.id === 'dark' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                    >
                        {currentTheme.id === 'dark' ? 'Switch Light' : 'Switch Dark'}
                    </button>
                </div>

                {/* Sound Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${currentTheme.border}`}>
                    <div className="text-left">
                        <h3 className="font-bold text-lg">Sound Effects</h3>
                        <p className={`text-xs font-medium ${currentTheme.subtext}`}>{soundEnabled ? 'On' : 'Off'}</p>
                    </div>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
                        aria-label="Toggle Sound"
                    />
                </div>

                {/* Timer Duration */}
                <div className={`p-4 rounded-2xl border ${currentTheme.border}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Guess Timer</h3>
                            <p className={`text-xs font-medium ${currentTheme.subtext}`}>{timerDuration === 0 ? 'Off' : `${timerDuration} seconds`}</p>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="120"
                        step="15"
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Off</span>
                        <span>30s</span>
                        <span>60s</span>
                        <span>90s</span>
                        <span>120s</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setPhase(PHASES.SETUP)}
                className={`mt-12 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${currentTheme.subtext} hover:${currentTheme.text} transition-colors`}
            >
                <ChevronRight className="rotate-180" size={16} /> Back to Menu
            </button>
        </div>
    )

    const renderPlayerSetup = () => {
        const playerColors = ['bg-cyan-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500']

        return (
            <div className="flex flex-col items-center w-full px-6 pt-8 text-center animate-fade-in">
                <h2 className={`text-3xl font-black uppercase tracking-tight mb-2 ${currentTheme.text}`}>Players</h2>
                <p className={`text-sm mb-6 ${currentTheme.subtext}`}>Add everyone who&apos;s playing</p>

                <div className="w-full max-w-sm space-y-3">
                    {players.map((player, idx) => (
                        <div key={player.id} className={`flex items-center gap-2 p-3 rounded-xl border ${currentTheme.border} ${currentTheme.panel}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${playerColors[idx % playerColors.length]}`}>
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <input
                                type="text"
                                value={player.name}
                                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                                placeholder="Enter name..."
                                className={`bg-transparent border-none focus:ring-0 flex-1 font-bold text-lg text-left ${currentTheme.text} outline-none placeholder:text-gray-500`}
                            />
                            {players.length > 2 && (
                                <button onClick={() => removePlayer(player.id)} className="text-red-500 p-2 hover:bg-white/5 rounded-full">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {players.length < 8 && (
                        <button onClick={addPlayer} className={`w-full py-3 rounded-xl border border-dashed ${currentTheme.border} ${currentTheme.subtext} font-bold hover:bg-white/5 flex items-center justify-center gap-2 transition-colors`}>
                            <Plus size={16} /> Add Player
                        </button>
                    )}
                </div>

                <p className={`text-xs mt-4 ${currentTheme.subtext}`}>
                    {players.length} players • Each takes turns giving clues
                </p>

                <button
                    onClick={() => setPhase(PHASES.SETUP)}
                    className={`mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${currentTheme.subtext} hover:${currentTheme.text} transition-colors`}
                >
                    <ChevronRight className="rotate-180" size={16} /> Done
                </button>
            </div>
        )
    }

    // Setup Phase
    const renderSetup = () => (
        <div className="flex flex-col items-center text-center animate-fade-in w-full px-4 pt-4">
            {/* Logo */}
            <div className="mb-10 w-full flex flex-col items-center">
                <div className="inline-flex items-center justify-center gap-3 mb-4 w-full max-w-[280px]">
                    <Waves size={40} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] shrink-0" />
                    <h1 className="text-4xl xs:text-5xl font-black bg-linear-to-r from-cyan-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent uppercase tracking-tight italic break-words text-center leading-none">
                        Wavelength
                    </h1>
                </div>
                <p className={`${currentTheme.subtext} text-xs font-medium tracking-widest uppercase opacity-80`}>
                    Sync Your Minds
                </p>
            </div>

            {showCustomInput ? (
                <CustomPairInput
                    onSubmit={handleCustomPair}
                    onCancel={() => setShowCustomInput(false)}
                    history={promptHistory}
                />
            ) : (
                <div className="w-full max-w-sm flex flex-col gap-5">
                    {/* Players Setup - Always visible */}
                    <div className={`backdrop-blur-md px-6 py-4 rounded-3xl w-full transition-all hover:bg-white/5 border ${currentTheme.id === 'light' ? 'bg-slate-200/50 border-slate-300' : 'bg-black/30 border-white/5'}`}>
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <h3 className={`font-bold text-sm ${currentTheme.text}`}>Players</h3>
                                <p className={`text-xs font-medium ${currentTheme.subtext}`}>{players.length} taking turns</p>
                            </div>
                            <button
                                onClick={() => setPhase(PHASES.PLAYER_SETUP)}
                                className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${currentTheme.id === 'light' ? 'bg-slate-300 text-slate-700 hover:bg-slate-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* 1v1 Mode - Only visible with exactly 2 players */}
                    {canEnable1v1 && (
                        <div className={`backdrop-blur-md px-6 py-4 rounded-3xl w-full transition-all border ${oneVsOneMode ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : ''} ${currentTheme.id === 'light' ? 'bg-slate-200/50 border-slate-300' : 'bg-black/30 border-white/5'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-left">
                                    <h3 className={`font-bold text-sm ${currentTheme.text}`}>1v1 Duel</h3>
                                    <p className={`text-xs font-medium ${currentTheme.subtext}`}>Competitive Mode</p>
                                </div>
                                <button
                                    onClick={() => setOneVsOneMode(!oneVsOneMode)}
                                    className={`toggle-switch ${oneVsOneMode ? 'active' : ''}`}
                                    aria-label="Toggle 1v1 Mode"
                                />
                            </div>

                            {/* Leaderboard when 1v1 is active */}
                            {oneVsOneMode && (
                                <div className="animate-fade-in border-t border-white/10 pt-3 mt-2">
                                    <div className="flex justify-between items-center gap-4">
                                        {players.map((player, idx) => (
                                            <div key={player.id} className={`flex-1 text-center p-2 rounded-lg ${idx === 0 ? 'bg-cyan-500/10' : 'bg-purple-500/10'}`}>
                                                <p className={`text-xs font-bold truncate ${idx === 0 ? 'text-cyan-400' : 'text-purple-400'}`}>{player.name}</p>
                                                <p className={`text-2xl font-black ${idx === 0 ? 'text-cyan-400' : 'text-purple-400'}`}>{player.score}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPlayers(prev => prev.map(p => ({ ...p, score: 0 })))}
                                        className="text-xs text-gray-500 hover:text-gray-400 mt-2 uppercase tracking-widest font-bold"
                                    >
                                        Reset Scores
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Team Mode Toggle - Only show if not in 1v1 mode */}
                    {!oneVsOneMode && (
                        <div className={`backdrop-blur-md px-6 py-4 rounded-3xl w-full transition-all hover:bg-white/5 border ${currentTheme.id === 'light' ? 'bg-slate-200/50 border-slate-300' : 'bg-black/30 border-white/5'}`}>
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <h3 className={`font-bold text-sm ${currentTheme.text}`}>Teams</h3>
                                    <p className={`text-xs font-medium ${currentTheme.subtext}`}>Score Tracking</p>
                                </div>
                                <button
                                    onClick={() => setEnableTeams(!enableTeams)}
                                    className={`toggle-switch ${enableTeams ? 'active' : ''}`}
                                    aria-label="Toggle Teams"
                                />
                            </div>
                        </div>
                    )}

                    {/* Chaos Mode Toggle */}
                    <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-3xl w-full flex items-center justify-between transition-all hover:bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 text-left">
                            <div className={`p-2 rounded-full ${chaosMode ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800. text-gray-500'}`}>
                                <Zap size={20} className={chaosMode ? 'drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]' : ''} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${currentTheme.text}`}>Chaos</h3>
                                <p className={`text-xs font-medium ${currentTheme.subtext}`}>Spicier Prompts</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChaosMode(!chaosMode)}
                            className={`toggle-switch ${chaosMode ? 'active' : ''}`}
                            aria-label="Toggle Chaos Mode"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-5 pt-6 mt-2">
                        <button
                            onClick={() => startNewRound()}
                            className="bg-cyan-400 text-black hover:bg-cyan-300 w-full py-5 rounded-full text-lg font-black tracking-wide shadow-lg hover:shadow-cyan-400/20 transition-all transform active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Play size={24} strokeWidth={3} fill="black" />
                                START ROUND
                            </span>
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCustomInput(true)}
                                className="bg-slate-800 hover:bg-slate-700 text-white flex-1 py-4 rounded-full font-bold tracking-wide border border-white/10 transition-all active:scale-[0.98]"
                            >
                                <span className="flex items-center justify-center gap-2 text-sm">
                                    <Hand size={18} />
                                    CUSTOM
                                </span>
                            </button>

                            <button
                                onClick={() => setPhase(PHASES.SETTINGS)}
                                className="bg-slate-800 hover:bg-slate-700 text-white flex-1 py-4 rounded-full font-bold tracking-wide border border-white/10 transition-all active:scale-[0.98]"
                            >
                                <span className="flex items-center justify-center gap-2 text-sm">
                                    <Settings size={18} />
                                    SETTINGS
                                </span>
                            </button>
                        </div>

                        {((enableTeams && teams.some(t => t.score > 0)) || (!enableTeams && totalScore > 0)) && (
                            <button
                                onClick={handleResetGame}
                                className="w-full py-3 rounded-full opacity-50 hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw size={14} />
                                    Reset Scores
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    // --- RENDER PHASES (Game Board Centered Layout) ---

    // Common Wrapper for Clue/Guess/Reveal
    const renderGamePhase = (content, actionButton) => (
        <div className="w-full h-full flex flex-col items-center justify-between pb-8 pt-24 relative px-4">
            {/* Top Area: Hint/Message */}
            <div className="w-full text-center z-10 flex-none min-h-[80px] flex flex-col justify-end pb-4">
                {content.top}
            </div>

            {/* Center Area: Dial */}
            <div className="w-full flex-1 flex flex-col items-center justify-center z-0">
                {content.center}
            </div>

            {/* Bottom Area: Action Button */}
            <div className="w-full max-w-[350px] z-20 flex-none pb-2">
                {actionButton}
            </div>

            {/* Privacy Banner */}
            {content.bottomBanner && (
                <div className="absolute bottom-1 left-0 w-full text-center pointer-events-none">
                    {content.bottomBanner}
                </div>
            )}
        </div>
    )

    const renderClue = () => renderGamePhase({
        top: (
            <div className="animate-fade-in space-y-1">
                <h2 className={`text-2xl font-black ${currentTheme.text} tracking-tight`}>Transmit Clue</h2>
                <p className={`${currentTheme.subtext} text-sm font-medium`}>Give a one-word hint</p>
            </div>
        ),
        center: (
            <DialSpectrum
                targetValue={targetValue}
                guessValue={guessValue}
                showTarget={true}
                showGuess={false}
                interactive={false}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                theme={currentTheme}
            />
        ),
        bottomBanner: (
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#ef4444] bg-red-900/20 px-3 py-1 rounded-full mb-1">
                <EyeOff size={12} /> Secure Channel
            </div>
        )
    }, (
        <button
            onClick={handleClueGiven}
            className="w-full py-4 rounded-full bg-linear-to-r from-red-500 to-orange-600 text-white text-lg font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
            Clue Given
        </button>
    ))

    const renderGuess = () => renderGamePhase({
        top: (
            <div className="animate-fade-in space-y-1">
                <div className="flex justify-center items-center gap-3">
                    <h2 className={`text-2xl font-black ${currentTheme.text} tracking-tight`}>Tune the Dial</h2>
                    {timerDuration > 0 && isTimerRunning && (
                        <div className={`font-mono font-bold text-lg flex items-center gap-1 px-2 py-0.5 rounded bg-black/30 w-fit ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                            <Clock size={14} /> {timeLeft}s
                        </div>
                    )}
                </div>
                <p className={`${currentTheme.subtext} text-sm font-medium`}>Find the frequency</p>
            </div>
        ),
        center: (
            <DialSpectrum
                targetValue={targetValue}
                guessValue={guessValue}
                showTarget={false}
                showGuess={true}
                onGuessChange={handleGuessChange}
                interactive={true}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                theme={currentTheme}
            />
        )
    }, (
        <button
            onClick={handleLockGuess}
            className="w-full py-4 rounded-full bg-cyan-500 text-black text-lg font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
            Lock Guess
        </button>
    ))

    const renderReveal = () => renderGamePhase({
        top: (
            <div className="animate-fade-in">
                {/* Show who scored in 1v1 mode */}
                {oneVsOneMode && canEnable1v1 && (
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${currentTheme.subtext}`}>
                        {currentPlayer.name}&apos;s Round
                    </p>
                )}
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`text-5xl font-black ${getScoreColor(roundScore).split(' ')[0]}`}>+{roundScore}</span>
                    <span className={`text-sm font-bold ${currentTheme.subtext} uppercase tracking-widest self-end pb-2`}>Points</span>
                </div>
                <h2 className={`text-xl font-black uppercase tracking-tighter ${getScoreColor(roundScore).split(' ')[0]}`}>
                    {getScoreMessage(roundScore)}
                </h2>

                {/* Show updated leaderboard in 1v1 mode */}
                {oneVsOneMode && canEnable1v1 && (
                    <div className="flex justify-center gap-6 mt-4 animate-fade-in">
                        {players.map((player, idx) => (
                            <div key={player.id} className={`text-center px-4 py-2 rounded-lg ${idx === currentPlayerIndex ? 'ring-2 ring-cyan-400/50' : ''} ${idx === 0 ? 'bg-cyan-500/10' : 'bg-purple-500/10'}`}>
                                <p className={`text-xs font-bold truncate ${idx === 0 ? 'text-cyan-400' : 'text-purple-400'}`}>{player.name}</p>
                                <p className={`text-xl font-black ${idx === 0 ? 'text-cyan-400' : 'text-purple-400'}`}>{player.score}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ),
        center: (
            <DialSpectrum
                targetValue={targetValue}
                guessValue={guessValue}
                showTarget={true}
                showGuess={true}
                interactive={false}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                theme={currentTheme}
            />
        )
    }, (
        <button
            onClick={handleNextRound}
            className="w-full py-4 rounded-full bg-slate-800 border border-white/10 text-white text-lg font-black uppercase tracking-widest shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
            Next Round <ChevronRight size={20} />
        </button>
    ))

    return (
        <div className={`w-full min-h-screen ${currentTheme.bg} transition-colors duration-500 ${currentTheme.text} font-sans selection:bg-cyan-500/30 flex items-center justify-center p-4`}>
            {/* Pass Device Warning Overlay */}
            {showPassWarning && (
                <PassDeviceWarning
                    targetRole={warningTarget}
                    onContinue={handlePassDeviceConfirm}
                    teamName={currentPlayer.name}
                    theme={currentTheme}
                />
            )}

            {/* Main Game Board Container */}
            <div className={`w-full max-w-md ${currentTheme.panel} transition-colors duration-500 rounded-3xl shadow-2xl relative overflow-visible flex flex-col items-center min-h-[600px] border ${currentTheme.border} ring-1 ring-white/5 pb-12`}>

                {/* Header (Always Visible outside of Setup) */}
                <Header
                    showQuit={phase !== PHASES.SETUP && phase !== PHASES.SETTINGS}
                    onQuit={handleQuitGame}
                    teams={teams}
                    currentTurnIndex={currentTurnIndex}
                    enableTeams={enableTeams}
                    totalScore={totalScore}
                    theme={currentTheme}
                />

                {/* Main Phase Content */}
                <main className="w-full flex-1 relative flex flex-col">
                    {phase === PHASES.SETUP && (
                        <div className="h-full flex items-center justify-center flex-1">
                            {renderSetup()}
                        </div>
                    )}
                    {phase === PHASES.SETTINGS && (
                        <div className="h-full flex items-center justify-center flex-1">
                            {renderSettings()}
                        </div>
                    )}
                    {phase === PHASES.PLAYER_SETUP && (
                        <div className="h-full flex items-center justify-center flex-1">
                            {renderPlayerSetup()}
                        </div>
                    )}
                    {phase === PHASES.CLUE && renderClue()}
                    {phase === PHASES.GUESS && renderGuess()}
                    {phase === PHASES.REVEAL && renderReveal()}
                </main>
            </div>
        </div>
    )
}

export default WavelengthGame
