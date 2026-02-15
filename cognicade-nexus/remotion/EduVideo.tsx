import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Sequence,
    Audio,
    staticFile,
} from 'remotion';

// ── Interfaces ──────────────────────────────────────────────────────────

export interface Beat {
    startSec: number;
    durationSec: number;
    layout: 'process' | 'transformation' | 'cycle' | 'comparison' | 'list' | 'focus' | 'split' | 'equation' | 'graph' | 'diagram';
    heading?: string;
    elements: string[];
    highlight?: string;
    text?: string;         // For equations: LaTeX-like text to display (e.g. "a² + b² = c²")
    subtitle?: string;     // Secondary explanatory text below the main visual
}

export interface ScreenplayScene {
    narration: string;
    beats: Beat[];
    audioUrl?: string | null;
    spriteUrls?: Record<string, string | null>;
}

// Palette passed in from the screenplay — Gemini picks colors per topic
export interface VideoPalette {
    primary: string;   // main accent e.g. '#34d399'
    secondary: string; // supporting e.g. '#60a5fa'
    tertiary: string;  // third accent e.g. '#a78bfa'
    bg: string;        // deep background e.g. '#050d14'
    surface: string;   // card/surface background e.g. '#0c1f2e'
}

export interface EduVideoProps {
    title?: string;
    scenes?: ScreenplayScene[];
    targetAudience?: string;
    palette?: VideoPalette;
    totalDurationSec?: number;
}

// ── Deterministic Hash ───────────────────────────────────────────────────

function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

// ── Fallback palettes (used only if no palette prop passed) ──────────────

const FALLBACK_PALETTES: VideoPalette[] = [
    { primary: '#34d399', secondary: '#60a5fa', tertiary: '#a78bfa', bg: '#050d14', surface: '#0c1f2e' },
    { primary: '#f472b6', secondary: '#fb923c', tertiary: '#fbbf24', bg: '#12040e', surface: '#200818' },
    { primary: '#38bdf8', secondary: '#34d399', tertiary: '#818cf8', bg: '#040d18', surface: '#081828' },
    { primary: '#fb923c', secondary: '#f472b6', tertiary: '#34d399', bg: '#120804', surface: '#1e1008' },
    { primary: '#a78bfa', secondary: '#ec4899', tertiary: '#38bdf8', bg: '#08060f', surface: '#100c1e' },
    { primary: '#facc15', secondary: '#f97316', tertiary: '#ef4444', bg: '#100a00', surface: '#1a1000' },
    { primary: '#2dd4bf', secondary: '#818cf8', tertiary: '#34d399', bg: '#030f10', surface: '#071a1c' },
];

function getFallbackPalette(seed: number): VideoPalette {
    return FALLBACK_PALETTES[seed % FALLBACK_PALETTES.length];
}

// ── Background builder ───────────────────────────────────────────────────

function makeBg(palette: VideoPalette, variant: number): string {
    const positions = ['30% 40%', '70% 30%', '50% 65%', '20% 70%', '80% 45%'];
    const pos = positions[variant % positions.length];
    return `radial-gradient(ellipse at ${pos}, ${palette.primary}28 0%, ${palette.bg} 65%), radial-gradient(ellipse at ${variant % 2 === 0 ? '80% 20%' : '20% 80%'}, ${palette.secondary}18 0%, transparent 55%)`;
}

// ── Sprite URL helper ────────────────────────────────────────────────────

function resolveSpriteUrl(url: string): string {
    return url.startsWith('http') ? url : staticFile(url.replace(/^\//, ''));
}

// ── Background Particles ────────────────────────────────────────────────

const Particles: React.FC<{ palette: VideoPalette; count: number; seed: number }> = ({ palette, count, seed }) => {
    const frame = useCurrentFrame();
    const rand = seededRandom(seed);
    const dots = React.useMemo(() => {
        const colors = [palette.primary, palette.secondary, palette.tertiary];
        return Array.from({ length: count }, (_, i) => ({
            x: rand() * 100, y: rand() * 100,
            size: 2 + rand() * 6, speed: 0.12 + rand() * 0.5,
            phase: rand() * Math.PI * 2,
            color: colors[i % 3],
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            {dots.map((d, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                    width: d.size, height: d.size, borderRadius: '50%', backgroundColor: d.color,
                    opacity: 0.08 + Math.sin(frame * 0.025 + d.phase) * 0.04,
                    transform: `translate(${Math.cos(frame * 0.013 * d.speed + d.phase) * 14}px, ${Math.sin(frame * 0.018 * d.speed + d.phase) * 16}px)`,
                }} />
            ))}
        </>
    );
};

// ── Decorative Shapes ────────────────────────────────────────────────────

const DecoShapes: React.FC<{ palette: VideoPalette; seed: number }> = ({ palette, seed }) => {
    const frame = useCurrentFrame();
    const rand = seededRandom(seed + 999);
    const shapes = React.useMemo(() => {
        const colors = [palette.primary, palette.secondary, palette.tertiary];
        return Array.from({ length: 5 + Math.floor(rand() * 4) }, (_, i) => ({
            x: rand() * 90 + 5, y: rand() * 80 + 10,
            size: 18 + rand() * 55, type: Math.floor(rand() * 3),
            rotSpeed: (rand() - 0.5) * 1.2, floatAmp: 8 + rand() * 18,
            phase: rand() * Math.PI * 2, color: colors[i % 3],
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            {shapes.map((s, i) => {
                const rot = frame * s.rotSpeed;
                const yF = Math.sin(frame * 0.03 + s.phase) * s.floatAmp;
                const xF = Math.cos(frame * 0.02 + s.phase) * s.floatAmp * 0.35;
                const base: React.CSSProperties = {
                    position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, opacity: 0.08,
                    transform: `translate(${xF}px, ${yF}px) rotate(${rot}deg)`,
                };
                if (s.type === 0) return <div key={i} style={{ ...base, width: s.size, height: s.size, borderRadius: '50%', border: `1.5px solid ${s.color}` }} />;
                if (s.type === 1) return <div key={i} style={{ ...base, width: s.size, height: s.size, borderRadius: 4, border: `1.5px solid ${s.color}` }} />;
                return <div key={i} style={{ ...base, width: s.size, height: s.size, borderRadius: 4, border: `1.5px solid ${s.color}`, transform: `translate(${xF}px, ${yF}px) rotate(${rot + 45}deg)` }} />;
            })}
        </>
    );
};

// ── Progress Bar ────────────────────────────────────────────────────────

const PBar: React.FC<{ p: number; palette: VideoPalette }> = ({ p, palette }) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <div style={{ width: `${Math.min(p * 100, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})` }} />
    </div>
);

// ── Scene Badge ──────────────────────────────────────────────────────────

const Badge: React.FC<{ n: number; palette: VideoPalette }> = ({ n, palette }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
    return (
        <div style={{ position: 'absolute', top: 22, left: 22, display: 'flex', alignItems: 'center', gap: 8, transform: `scale(${ent})`, opacity: ent, zIndex: 20 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: palette.bg,
                boxShadow: `0 2px 14px ${palette.primary}66`,
            }}>{n}</div>
            <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${palette.primary}, transparent)` }} />
        </div>
    );
};

// ── Element Card ────────────────────────────────────────────────────────
// Size is controlled externally via `size` prop

const ECard: React.FC<{
    label: string;
    delay: number;
    color: string;
    bgColor: string;
    size?: 'sm' | 'md' | 'lg';
    imageUrl?: string | null;
    highlighted?: boolean;
}> = ({ label, delay, color, bgColor, size = 'md', imageUrl, highlighted }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
    const sc = interpolate(ent, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const op = interpolate(ent, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
    const yF = Math.sin((frame - delay) * 0.035) * 3;
    const pulse = highlighted ? 1 + Math.sin((frame - delay) * 0.09) * 0.035 : 1;

    const sizes = {
        sm: { fs: 16, pad: '14px 18px', img: 52, minW: 120 },
        md: { fs: 20, pad: '18px 24px', img: 68, minW: 150 },
        lg: { fs: 26, pad: '22px 30px', img: 84, minW: 180 },
    };
    const s = sizes[size];

    return (
        <div style={{
            transform: `scale(${sc * pulse}) translateY(${yF}px)`, opacity: op,
            background: highlighted
                ? `linear-gradient(135deg, ${color}38, ${color}20)`
                : `linear-gradient(135deg, ${color}30, ${bgColor})`,
            border: `2px solid ${highlighted ? color + 'cc' : color + '55'}`,
            borderRadius: 16, padding: s.pad, fontSize: s.fs, fontWeight: 700, color: 'white',
            textAlign: 'center', backdropFilter: 'blur(12px)',
            boxShadow: highlighted
                ? `0 6px 40px ${color}55, inset 0 1px 0 rgba(255,255,255,0.12)`
                : `0 4px 24px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
            flexShrink: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: imageUrl ? 8 : 0,
            minWidth: s.minW,
            maxWidth: 260,
            letterSpacing: '0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
            {imageUrl && (
                <div style={{
                    width: s.img, height: s.img, borderRadius: 10,
                    background: `${color}18`, border: `1px solid ${color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', padding: 5,
                }}>
                    <img
                        src={resolveSpriteUrl(imageUrl)}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: `drop-shadow(0 2px 8px ${color}66)` }}
                        alt={label}
                    />
                </div>
            )}
            <div style={{ whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{label}</div>
        </div>
    );
};

// ── Animated Arrow ───────────────────────────────────────────────────────

const Arr: React.FC<{ delay: number; color: string; vertical?: boolean }> = ({ delay, color, vertical }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const p = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
    const len = interpolate(p, [0, 1], [0, 48], { extrapolateRight: 'clamp' });
    const op = interpolate(p, [0, 0.3], [0, 0.85], { extrapolateRight: 'clamp' });

    if (vertical) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op, flexShrink: 0 }}>
            <div style={{ width: 3, height: len, background: `linear-gradient(180deg, ${color}88, ${color})`, borderRadius: 2 }} />
            <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `9px solid ${color}`, opacity: p > 0.7 ? 1 : 0 }} />
        </div>
    );
    return (
        <div style={{ display: 'flex', alignItems: 'center', opacity: op, flexShrink: 0 }}>
            <div style={{ width: len, height: 3, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 2 }} />
            <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: `9px solid ${color}`, opacity: p > 0.7 ? 1 : 0 }} />
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// LAYOUT ANIMATIONS
// Key constraint: NEVER use flexWrap on process/flow layouts.
// Instead, auto-detect vertical vs horizontal based on element count.
// ══════════════════════════════════════════════════════════════════════════

// ── FOCUS ────────────────────────────────────────────────────────────────

const FocusAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    text?: string; subtitle?: string;
}> = ({ elements, palette, highlight, spriteUrls, text, subtitle }) => {
    const { fps } = useVideoConfig();
    const els = elements.slice(0, 4); // max 4
    const stag = Math.floor(fps * 0.45);
    const cardSize = els.length <= 2 ? 'lg' : els.length === 3 ? 'md' : 'sm';

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'center',
            gap: cardSize === 'lg' ? 40 : 28,
            maxWidth: '94%',
        }}>
            {text && (
                <div style={{
                    fontSize: text.length > 25 ? 32 : 42,
                    fontWeight: 300,
                    color: 'white',
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontStyle: 'italic',
                    textShadow: `0 0 20px ${palette.primary}88, 0 4px 12px rgba(0,0,0,0.6)`,
                    textAlign: 'center',
                    maxWidth: '85%',
                    marginBottom: 12,
                    letterSpacing: '2px',
                }}>
                    {text}
                </div>
            )}
            {els.map((el, i) => (
                <ECard key={i} label={el} delay={i * stag}
                    color={i % 2 === 0 ? palette.primary : palette.secondary}
                    bgColor={palette.surface}
                    size={cardSize}
                    imageUrl={spriteUrls?.[el] ?? null}
                    highlighted={el === highlight}
                />
            ))}
        </div>
    );
};

// ── PROCESS ──────────────────────────────────────────────────────────────
// Critical: enforce single-axis layout. ≤4 elements → horizontal, else vertical.
// Never use flexWrap.

const ProcessAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
}> = ({ elements, palette, highlight, spriteUrls }) => {
    const { fps } = useVideoConfig();
    const els = elements.slice(0, 5);
    const vertical = els.length > 3;
    const gap = Math.floor((2.8 * fps) / Math.max(els.length, 1));
    const cardSize: 'sm' | 'md' | 'lg' = vertical ? 'sm' : els.length <= 3 ? 'lg' : 'md';

    // Scale down vertical flows to prevent clipping off-screen
    // Each card ~70px + arrow ~30px = ~100px per step. Available height ~520px (after heading + bottom padding)
    const estimatedHeight = vertical ? els.length * 100 + (els.length - 1) * 16 : 0;
    const availableHeight = 520; // rough available px
    const verticalScale = vertical && estimatedHeight > availableHeight ? availableHeight / estimatedHeight : 1;

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%, -50%) scale(${verticalScale})`,
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: vertical ? 8 : 20,
            maxWidth: vertical ? 420 : '96%',
        }}>
            {els.map((el, i) => (
                <React.Fragment key={i}>
                    <ECard label={el} delay={i * gap}
                        color={i % 2 === 0 ? palette.primary : palette.secondary}
                        bgColor={palette.surface}
                        size={cardSize}
                        imageUrl={spriteUrls?.[el] ?? null}
                        highlighted={el === highlight}
                    />
                    {i < els.length - 1 && (
                        <Arr delay={i * gap + Math.floor(gap * 0.5)}
                            color={palette.primary}
                            vertical={vertical}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ── TRANSFORMATION ───────────────────────────────────────────────────────

const TransformAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
}> = ({ elements, palette, highlight, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mid = Math.ceil(elements.length / 2);
    const inputs = elements.slice(0, mid).slice(0, 3);
    const outputs = elements.slice(mid).slice(0, 3);
    const inStag = Math.floor((fps * 1.8) / Math.max(inputs.length, 1));
    const tDelay = inputs.length * inStag + Math.floor(fps * 0.6);
    const outStart = tDelay + Math.floor(fps * 1.0);
    const outStag = Math.floor((fps * 1.8) / Math.max(outputs.length, 1));
    const tEnt = spring({ frame: frame - tDelay, fps, config: { damping: 12, stiffness: 60 } });
    const rot = (frame - tDelay) * 0.35;
    const cardSize = inputs.length + outputs.length <= 4 ? 'md' : 'sm';

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flex: 1, paddingLeft: 50 }}>
                {inputs.map((el, i) => (
                    <ECard key={i} label={el} delay={i * inStag}
                        color={palette.primary} bgColor={palette.surface}
                        size={cardSize} imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />
                ))}
            </div>
            {/* Center transform */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 20px', flexShrink: 0 }}>
                <Arr delay={tDelay - fps} color={palette.primary} />
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: `2.5px solid ${palette.primary}`,
                    background: `radial-gradient(circle, ${palette.primary}22, ${palette.surface})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, color: 'white',
                    boxShadow: `0 0 40px ${palette.primary}55, inset 0 0 20px ${palette.primary}11`,
                    transform: `rotate(${rot}deg) scale(${tEnt})`, opacity: tEnt,
                }}>⟹</div>
                <Arr delay={tDelay + fps} color={palette.secondary} />
            </div>
            {/* Outputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flex: 1, paddingRight: 50 }}>
                {outputs.map((el, i) => (
                    <ECard key={i} label={el} delay={outStart + i * outStag}
                        color={palette.secondary} bgColor={palette.surface}
                        size={cardSize} imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />
                ))}
            </div>
        </div>
    );
};

// ── CYCLE ────────────────────────────────────────────────────────────────

const CycleAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
}> = ({ elements, palette, highlight, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const els = elements.slice(0, 6);
    const n = els.length;
    // Tighter radius so cards don't go off screen
    const r = n <= 3 ? 186 : n <= 5 ? 210 : 228;
    const stag = Math.floor((4 * fps) / Math.max(n, 1));
    const orbAngle = (frame * 0.022) % (Math.PI * 2);
    const orbOp = interpolate(frame, [n * stag, n * stag + fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const colors = [palette.primary, palette.secondary, palette.tertiary];

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `1.5px dashed ${palette.primary}25` }} />
            <div style={{ position: 'absolute', left: -28, top: -28, width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle, ${palette.primary}44, ${palette.primary}11)`, boxShadow: `0 0 40px ${palette.primary}44` }} />
            {els.map((el, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                const ex = Math.cos(a) * r;
                const ey = Math.sin(a) * r;
                const ent = spring({ frame: frame - i * stag, fps, config: { damping: 14, stiffness: 100 } });
                const yF = Math.sin(frame * 0.03 + i) * 3;
                const imgUrl = spriteUrls?.[el];
                const col = colors[i % 3];
                const isHl = el === highlight;
                return (
                    <div key={i} style={{
                        position: 'absolute', left: ex, top: ey,
                        transform: `translate(-50%, -50%) scale(${ent}) translateY(${yF}px)`, opacity: ent,
                        background: isHl ? `linear-gradient(135deg, ${col}35, ${palette.surface})` : `linear-gradient(135deg, ${col}20, ${palette.surface})`,
                        border: `1.5px solid ${isHl ? col + 'cc' : col + '55'}`,
                        borderRadius: 12, padding: imgUrl ? '9px 12px' : '8px 14px',
                        fontSize: 14, fontWeight: 700, color: 'white', textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        boxShadow: isHl ? `0 4px 28px ${col}55` : `0 3px 16px ${col}22`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: imgUrl ? 7 : 0,
                        minWidth: imgUrl ? 96 : 'auto', maxWidth: 140,
                    }}>
                        {imgUrl && (
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${col}18`, border: `1px solid ${col}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 4 }}>
                                <img src={resolveSpriteUrl(imgUrl)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: `drop-shadow(0 2px 6px ${col}66)` }} alt={el} />
                            </div>
                        )}
                        <div style={{ whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{el}</div>
                    </div>
                );
            })}
            <div style={{
                position: 'absolute', left: Math.cos(orbAngle) * r - 5, top: Math.sin(orbAngle) * r - 5,
                width: 10, height: 10, borderRadius: '50%',
                background: `radial-gradient(circle, white, ${palette.primary})`,
                boxShadow: `0 0 16px ${palette.primary}`, opacity: orbOp,
            }} />
        </div>
    );
};

// ── COMPARISON ───────────────────────────────────────────────────────────

const CompareAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    labelA?: string; labelB?: string;
}> = ({ elements, palette, highlight, spriteUrls, labelA = 'Side A', labelB = 'Side B' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mid = Math.ceil(elements.length / 2);
    const left = elements.slice(0, mid).slice(0, 3);
    const right = elements.slice(mid).slice(0, 3);
    const stag = Math.floor(fps * 1.2);
    const divH = interpolate(frame, [0, 2 * fps], [0, 340], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const labelOp = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const cardSize = left.length + right.length <= 4 ? 'md' : 'sm';

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 36px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: palette.primary, textTransform: 'uppercase', letterSpacing: 4, opacity: labelOp, textShadow: `0 0 12px ${palette.primary}88` }}>{labelA}</div>
                {left.map((el, i) => <ECard key={i} label={el} delay={fps * 0.4 + i * stag} color={palette.primary} bgColor={palette.surface} size={cardSize} imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />)}
            </div>
            <div style={{ width: 2, height: divH, background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary})`, opacity: 0.4, flexShrink: 0, borderRadius: 2 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 36px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: palette.secondary, textTransform: 'uppercase', letterSpacing: 4, opacity: labelOp, textShadow: `0 0 12px ${palette.secondary}88` }}>{labelB}</div>
                {right.map((el, i) => <ECard key={i} label={el} delay={fps * 0.8 + i * stag} color={palette.secondary} bgColor={palette.surface} size={cardSize} imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />)}
            </div>
        </div>
    );
};

// ── LIST ─────────────────────────────────────────────────────────────────

const ListAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
}> = ({ elements, palette, highlight, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const els = elements.slice(0, 5);
    const stag = Math.floor((5.5 * fps) / Math.max(els.length, 1));
    const colors = [palette.primary, palette.secondary, palette.tertiary];

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start',
        }}>
            {els.map((el, i) => {
                const d = i * stag;
                const col = colors[i % 3];
                const bEnt = spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 120 } });
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${col}, ${col}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 800, color: palette.bg,
                            transform: `scale(${bEnt})`, opacity: bEnt, flexShrink: 0,
                            boxShadow: `0 3px 14px ${col}55`,
                        }}>{i + 1}</div>
                        <ECard label={el} delay={d + 5} color={col} bgColor={palette.surface}
                            size={els.length <= 3 ? 'lg' : 'md'}
                            imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />
                    </div>
                );
            })}
        </div>
    );
};

// ── SPLIT ─────────────────────────────────────────────────────────────────

const SplitAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    labelA?: string; labelB?: string;
}> = ({ elements, palette, highlight, spriteUrls, labelA, labelB }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mid = Math.ceil(elements.length / 2);
    const left = elements.slice(0, mid).slice(0, 3);
    const right = elements.slice(mid).slice(0, 3);
    const stag = Math.floor(fps * 0.65);
    const labelOp = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', gap: 44, alignItems: 'flex-start', maxWidth: '92%',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, alignItems: 'center' }}>
                {labelA && <div style={{ fontSize: 11, fontWeight: 700, color: palette.primary, textTransform: 'uppercase', letterSpacing: 4, opacity: labelOp }}>{labelA}</div>}
                {left.map((el, i) => (
                    <ECard key={i} label={el} delay={i * stag} color={palette.primary} bgColor={palette.surface}
                        size={left.length <= 2 ? 'lg' : 'md'}
                        imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />
                ))}
            </div>
            <div style={{ width: 2, alignSelf: 'stretch', background: `linear-gradient(180deg, ${palette.primary}55, ${palette.secondary}55)`, flexShrink: 0, borderRadius: 2 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, alignItems: 'center' }}>
                {labelB && <div style={{ fontSize: 11, fontWeight: 700, color: palette.secondary, textTransform: 'uppercase', letterSpacing: 4, opacity: labelOp }}>{labelB}</div>}
                {right.map((el, i) => (
                    <ECard key={i} label={el} delay={(mid + i) * stag} color={palette.secondary} bgColor={palette.surface}
                        size={right.length <= 2 ? 'lg' : 'md'}
                        imageUrl={spriteUrls?.[el] ?? null} highlighted={el === highlight} />
                ))}
            </div>
        </div>
    );
};

// ── MATH TEXT RENDERER ───────────────────────────────────────────────────
// Converts equation text with subscripts/superscripts into React elements
// Handles: Unicode sub/superscripts (₂, ², etc.), caret notation (x^2, H_2O),
// and braced groups (x^{2n}, a_{ij})

const UNICODE_SUP_MAP: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
    'ⁿ': 'n', 'ⁱ': 'i',
};
const UNICODE_SUB_MAP: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
    'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₙ': 'n',
};

const renderMathText = (input: string, fontSize: number): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let i = 0;
    let key = 0;
    const subStyle: React.CSSProperties = { fontSize: fontSize * 0.6, verticalAlign: 'sub', lineHeight: '1' };
    const supStyle: React.CSSProperties = { fontSize: fontSize * 0.6, verticalAlign: 'super', lineHeight: '1' };

    while (i < input.length) {
        const ch = input[i];

        // Unicode superscript characters
        if (UNICODE_SUP_MAP[ch]) {
            let group = UNICODE_SUP_MAP[ch];
            i++;
            while (i < input.length && UNICODE_SUP_MAP[input[i]]) {
                group += UNICODE_SUP_MAP[input[i]];
                i++;
            }
            nodes.push(<span key={key++} style={supStyle}>{group}</span>);
            continue;
        }

        // Unicode subscript characters
        if (UNICODE_SUB_MAP[ch]) {
            let group = UNICODE_SUB_MAP[ch];
            i++;
            while (i < input.length && UNICODE_SUB_MAP[input[i]]) {
                group += UNICODE_SUB_MAP[input[i]];
                i++;
            }
            nodes.push(<span key={key++} style={subStyle}>{group}</span>);
            continue;
        }

        // Caret notation: x^2, x^{2n}
        if (ch === '^' && i + 1 < input.length) {
            i++;
            if (input[i] === '{') {
                const close = input.indexOf('}', i);
                const content = close > i ? input.substring(i + 1, close) : input[i + 1] || '';
                nodes.push(<span key={key++} style={supStyle}>{content}</span>);
                i = close > i ? close + 1 : i + 2;
            } else {
                nodes.push(<span key={key++} style={supStyle}>{input[i]}</span>);
                i++;
            }
            continue;
        }

        // Underscore notation: H_2, a_{ij}
        if (ch === '_' && i + 1 < input.length) {
            i++;
            if (input[i] === '{') {
                const close = input.indexOf('}', i);
                const content = close > i ? input.substring(i + 1, close) : input[i + 1] || '';
                nodes.push(<span key={key++} style={subStyle}>{content}</span>);
                i = close > i ? close + 1 : i + 2;
            } else {
                nodes.push(<span key={key++} style={subStyle}>{input[i]}</span>);
                i++;
            }
            continue;
        }

        // Normal character — batch consecutive normal chars
        let normal = ch;
        i++;
        while (i < input.length && !UNICODE_SUP_MAP[input[i]] && !UNICODE_SUB_MAP[input[i]] && input[i] !== '^' && input[i] !== '_') {
            normal += input[i];
            i++;
        }
        nodes.push(<span key={key++}>{normal}</span>);
    }

    return nodes;
};

// ── EQUATION ──────────────────────────────────────────────────────────────
// 3Blue1Brown style — large equation centered on screen with animated reveal

const EquationAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    text?: string; subtitle?: string;
}> = ({ elements, palette, highlight, spriteUrls, text, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Equation text animation - typewriter-like reveal
    const eqText = text || elements.join(' + ') + ' = ?';
    const charCount = eqText.length;
    const revealProgress = interpolate(frame, [0, Math.min(fps * 2, charCount * 3)], [0, 1], { extrapolateRight: 'clamp' });
    const visibleChars = Math.floor(revealProgress * charCount);
    const eqOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: 'clamp' });

    // Glow pulse on the equation
    const glowIntensity = 20 + Math.sin(frame * 0.06) * 8;

    // Subtitle fade in after equation
    const subOp = interpolate(frame, [fps * 2, fps * 2.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const els = elements.slice(0, 4);
    const cardStag = Math.floor(fps * 0.4);
    const cardStart = Math.floor(fps * 1.5); // cards appear after equation starts

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Main equation display */}
            {(() => {
                const eqFontSize = eqText.length > 30 ? 36 : eqText.length > 20 ? 44 : 56;
                return (
                    <div style={{
                        fontSize: eqFontSize,
                        fontWeight: 300,
                        color: 'white',
                        fontFamily: '"Georgia", "Times New Roman", serif',
                        fontStyle: 'italic',
                        letterSpacing: '3px',
                        textShadow: `0 0 ${glowIntensity}px ${palette.primary}aa, 0 0 ${glowIntensity * 2}px ${palette.primary}44, 0 4px 16px rgba(0,0,0,0.6)`,
                        opacity: eqOpacity,
                        textAlign: 'center',
                        maxWidth: '90%',
                        lineHeight: 1.4,
                        padding: '0 40px',
                    }}>
                        <span>{renderMathText(eqText.substring(0, visibleChars), eqFontSize)}</span>
                        <span style={{ opacity: 0.15 }}>{renderMathText(eqText.substring(visibleChars), eqFontSize)}</span>
                    </div>
                );
            })()}


            {/* Underline accent */}
            <div style={{
                width: interpolate(frame, [fps * 0.5, fps * 2], [0, Math.min(500, eqText.length * 14)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                height: 2,
                background: `linear-gradient(90deg, transparent, ${palette.primary}, ${palette.secondary}, transparent)`,
                margin: '16px 0',
                borderRadius: 2,
                boxShadow: `0 0 12px ${palette.primary}66`,
            }} />

            {/* Subtitle explanation */}
            {subtitle && (
                <div style={{
                    fontSize: 18,
                    color: `${palette.secondary}cc`,
                    fontWeight: 400,
                    letterSpacing: '1px',
                    opacity: subOp,
                    textAlign: 'center',
                    maxWidth: '70%',
                    marginBottom: 20,
                }}>
                    {renderMathText(subtitle, 18)}
                </div>
            )}

            {/* Term cards below equation */}
            {els.length > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 24, marginTop: 12, maxWidth: '90%',
                }}>
                    {els.map((el, i) => (
                        <ECard key={i} label={el} delay={cardStart + i * cardStag}
                            color={[palette.primary, palette.secondary, palette.tertiary][i % 3]}
                            bgColor={palette.surface}
                            size="sm"
                            imageUrl={spriteUrls?.[el] ?? null}
                            highlighted={el === highlight}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ── GRAPH ─────────────────────────────────────────────────────────────────
// Animated coordinate plane with labeled axes and bars from elements

const GraphAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    text?: string; subtitle?: string;
}> = ({ elements, palette, highlight, text, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const els = elements.slice(0, 6);
    const axisProgress = interpolate(frame, [0, fps * 1.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const gridOp = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const graphW = 560;
    const graphH = 340;
    const padding = 60;

    // Label reveal
    const labelOp = interpolate(frame, [fps * 2, fps * 2.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const subOp = interpolate(frame, [fps * 2.5, fps * 3.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const colors = [palette.primary, palette.secondary, palette.tertiary];

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: graphW + padding * 2, height: graphH + padding * 2 }}>
            {/* Grid lines */}
            {Array.from({ length: 5 }, (_, i) => {
                const y = padding + (graphH / 4) * i;
                return <div key={`h${i}`} style={{ position: 'absolute', left: padding, top: y, width: graphW, height: 1, backgroundColor: `${palette.primary}`, opacity: gridOp }} />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
                const x = padding + (graphW / 4) * i;
                return <div key={`v${i}`} style={{ position: 'absolute', left: x, top: padding, width: 1, height: graphH, backgroundColor: `${palette.primary}`, opacity: gridOp }} />;
            })}

            {/* Y axis */}
            <div style={{
                position: 'absolute', left: padding, top: padding,
                width: 2, height: graphH * axisProgress,
                background: `linear-gradient(180deg, ${palette.primary}, ${palette.primary}88)`,
                borderRadius: 2,
            }} />
            {/* X axis */}
            <div style={{
                position: 'absolute', left: padding, top: padding + graphH,
                width: graphW * axisProgress, height: 2,
                background: `linear-gradient(90deg, ${palette.primary}88, ${palette.primary})`,
                borderRadius: 2,
            }} />

            {/* Bars / data points for each element */}
            {els.map((el, i) => {
                const barDelay = fps * 1.5 + i * Math.floor(fps * 0.4);
                const barEnt = spring({ frame: frame - barDelay, fps, config: { damping: 14, stiffness: 80 } });
                const barHeight = (0.3 + (hashStr(el) % 70) / 100) * graphH; // Deterministic height from name
                const barW = Math.max(30, Math.floor((graphW - 20) / els.length) - 12);
                const barX = padding + 10 + i * (barW + 12);
                const col = colors[i % 3];

                return (
                    <React.Fragment key={i}>
                        {/* Bar */}
                        <div style={{
                            position: 'absolute',
                            left: barX,
                            bottom: padding + 2,
                            width: barW,
                            height: barHeight * barEnt,
                            background: `linear-gradient(180deg, ${col}, ${col}88)`,
                            borderRadius: '6px 6px 0 0',
                            boxShadow: `0 0 20px ${col}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
                            opacity: barEnt,
                        }} />
                        {/* Label below */}
                        <div style={{
                            position: 'absolute',
                            left: barX,
                            top: padding + graphH + 10,
                            width: barW,
                            textAlign: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            color: col,
                            opacity: labelOp,
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {el}
                        </div>
                    </React.Fragment>
                );
            })}

            {/* Title text (equation or description) */}
            {text && (
                <div style={{
                    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 20, fontWeight: 600, color: 'white',
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontStyle: 'italic',
                    opacity: labelOp,
                    textShadow: `0 0 16px ${palette.primary}66`,
                    letterSpacing: '2px',
                    textAlign: 'center',
                }}>
                    {text}
                </div>
            )}

            {subtitle && (
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 14, color: `${palette.secondary}bb`, opacity: subOp,
                    textAlign: 'center', whiteSpace: 'nowrap',
                }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};

// ── DIAGRAM ───────────────────────────────────────────────────────────────
// Geometric shapes, Venn diagrams, visual proofs with animated polygon vertices

const DiagramAnim: React.FC<{
    elements: string[]; palette: VideoPalette; highlight?: string; spriteUrls?: Record<string, string | null>;
    text?: string; subtitle?: string;
}> = ({ elements, palette, highlight, text, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const els = elements.slice(0, 6);
    const n = els.length;
    const colors = [palette.primary, palette.secondary, palette.tertiary];

    // Draw a geometric figure — vertices arranged in a polygon
    const radius = n <= 3 ? 140 : n <= 4 ? 150 : 130;

    // Calculate vertex positions
    const vertices = els.map((_, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });

    // Edge reveal progress
    const edgeProgress = interpolate(frame, [fps * 0.8, fps * 2.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const labelDelay = fps * 1.5;

    const textOp = interpolate(frame, [fps * 2.5, fps * 3.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const subOp = interpolate(frame, [fps * 3, fps * 3.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {/* SVG for edges */}
            <svg width={radius * 2 + 200} height={radius * 2 + 200} style={{
                position: 'absolute', left: -(radius + 100), top: -(radius + 100),
                overflow: 'visible',
            }}>
                {/* Draw edges between consecutive vertices */}
                {vertices.map((v, i) => {
                    const next = vertices[(i + 1) % n];
                    const edgeIdx = i / n;
                    const thisEdgeProgress = interpolate(edgeProgress, [edgeIdx, Math.min(1, edgeIdx + 1 / n + 0.1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    const ex = v.x + (next.x - v.x) * thisEdgeProgress;
                    const ey = v.y + (next.y - v.y) * thisEdgeProgress;
                    const col = colors[i % 3];
                    return (
                        <line key={i}
                            x1={v.x + radius + 100} y1={v.y + radius + 100}
                            x2={ex + radius + 100} y2={ey + radius + 100}
                            stroke={col} strokeWidth={2.5} strokeLinecap="round"
                            opacity={0.8}
                        />
                    );
                })}

                {/* Diagonal lines for visual interest (only if 4+ vertices) */}
                {n >= 4 && vertices.map((v, i) => {
                    if (i >= n - 2) return null;
                    const opp = vertices[i + 2];
                    const diagProgress = interpolate(frame, [fps * 2.5 + i * 8, fps * 3.5 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    return (
                        <line key={`d${i}`}
                            x1={v.x + radius + 100} y1={v.y + radius + 100}
                            x2={v.x + (opp.x - v.x) * diagProgress + radius + 100}
                            y2={v.y + (opp.y - v.y) * diagProgress + radius + 100}
                            stroke={palette.tertiary} strokeWidth={1.5} strokeDasharray="6 4"
                            opacity={0.4 * diagProgress}
                        />
                    );
                })}
            </svg>

            {/* Vertex labels */}
            {els.map((el, i) => {
                const v = vertices[i];
                const ent = spring({ frame: frame - labelDelay - i * Math.floor(fps * 0.3), fps, config: { damping: 14, stiffness: 100 } });
                const col = colors[i % 3];
                const isHl = el === highlight;
                // Push label outward from center
                const angle = Math.atan2(v.y, v.x);
                const labelDist = 32;
                const lx = v.x + Math.cos(angle) * labelDist;
                const ly = v.y + Math.sin(angle) * labelDist;

                return (
                    <React.Fragment key={i}>
                        {/* Vertex dot */}
                        <div style={{
                            position: 'absolute',
                            left: v.x - 6, top: v.y - 6,
                            width: 12, height: 12, borderRadius: '50%',
                            background: `radial-gradient(circle, white, ${col})`,
                            boxShadow: `0 0 12px ${col}88`,
                            transform: `scale(${ent})`, opacity: ent,
                        }} />
                        {/* Label */}
                        <div style={{
                            position: 'absolute',
                            left: lx, top: ly,
                            transform: `translate(-50%, -50%) scale(${ent})`,
                            opacity: ent,
                            fontSize: 15, fontWeight: 700, color: isHl ? 'white' : col,
                            textShadow: isHl ? `0 0 14px ${col}cc` : `0 2px 6px rgba(0,0,0,0.8)`,
                            background: isHl ? `${col}30` : `${palette.surface}cc`,
                            border: `1.5px solid ${isHl ? col + 'cc' : col + '44'}`,
                            borderRadius: 10, padding: '4px 12px',
                            backdropFilter: 'blur(6px)',
                            whiteSpace: 'nowrap',
                        }}>
                            {el}
                        </div>
                    </React.Fragment>
                );
            })}

            {/* Equation text overlay */}
            {text && (
                <div style={{
                    position: 'absolute', left: '50%', top: -(radius + 70),
                    transform: 'translateX(-50%)',
                    fontSize: 24, fontWeight: 300, color: 'white',
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontStyle: 'italic',
                    textShadow: `0 0 20px ${palette.primary}88`,
                    opacity: textOp,
                    textAlign: 'center',
                    letterSpacing: '2px',
                }}>
                    {text}
                </div>
            )}

            {subtitle && (
                <div style={{
                    position: 'absolute', left: '50%', top: radius + 60,
                    transform: 'translateX(-50%)',
                    fontSize: 15, color: `${palette.secondary}bb`,
                    opacity: subOp, textAlign: 'center', whiteSpace: 'nowrap',
                }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// BEAT RENDERER
// ══════════════════════════════════════════════════════════════════════════

const BeatRenderer: React.FC<{
    beat: Beat;
    palette: VideoPalette;
    spriteUrls?: Record<string, string | null>;
    beatDurFrames: number;
}> = ({ beat, palette, spriteUrls, beatDurFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const fadeIn = interpolate(frame, [0, Math.min(9, beatDurFrames * 0.18)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [beatDurFrames - Math.min(8, beatDurFrames * 0.15), beatDurFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const opacity = Math.min(fadeIn, fadeOut);

    const headEnt = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
    const headY = interpolate(headEnt, [0, 1], [12, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity }}>
            {beat.heading && (
                <div style={{
                    position: 'absolute', top: 36, left: '50%',
                    transform: `translateX(-50%) translateY(${headY}px) scale(${headEnt})`,
                    fontSize: 28, fontWeight: 800, color: 'white',
                    textShadow: `0 0 24px ${palette.primary}88, 0 2px 8px rgba(0,0,0,0.7)`,
                    letterSpacing: '4px', textTransform: 'uppercase',
                    opacity: headEnt, zIndex: 10, textAlign: 'center',
                    background: `linear-gradient(135deg, ${palette.primary}22, ${palette.surface}dd)`,
                    border: `1px solid ${palette.primary}44`,
                    borderBottom: `2px solid ${palette.primary}66`,
                    borderRadius: 30, padding: '10px 32px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 24px ${palette.primary}22`,
                    maxWidth: '85%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {beat.heading}
                </div>
            )}

            <div style={{ position: 'absolute', top: beat.heading ? 90 : 0, left: 0, right: 0, bottom: 30 }}>
                {beat.layout === 'focus' && <FocusAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} text={beat.text} subtitle={beat.subtitle} />}
                {beat.layout === 'process' && <ProcessAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'transformation' && <TransformAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'cycle' && <CycleAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'comparison' && <CompareAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'list' && <ListAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'split' && <SplitAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} />}
                {beat.layout === 'equation' && <EquationAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} text={beat.text} subtitle={beat.subtitle} />}
                {beat.layout === 'graph' && <GraphAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} text={beat.text} subtitle={beat.subtitle} />}
                {beat.layout === 'diagram' && <DiagramAnim elements={beat.elements} palette={palette} highlight={beat.highlight} spriteUrls={spriteUrls} text={beat.text} subtitle={beat.subtitle} />}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// SCENES
// ══════════════════════════════════════════════════════════════════════════

const IntroScene: React.FC<{ title: string; audience: string; palette: VideoPalette; seed: number }> = ({ title, audience, palette, seed }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
    const tOp = interpolate(frame, [0, 28], [0, 1], { extrapolateRight: 'clamp' });
    const lineW = interpolate(frame, [14, 52], [0, 480], { extrapolateRight: 'clamp' });
    const subOp = interpolate(frame, [28, 52], [0, 1], { extrapolateRight: 'clamp' });
    const glow = 22 + Math.sin(frame * 0.1) * 10;

    return (
        <AbsoluteFill style={{ background: makeBg(palette, seed) }}>
            <Particles palette={palette} count={18 + (seed % 8)} seed={seed} />
            <DecoShapes palette={palette} seed={seed} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${ent})`, textAlign: 'center', opacity: tOp }}>
                <h1 style={{
                    fontSize: title.length > 32 ? 40 : title.length > 22 ? 50 : 60,
                    fontWeight: 900, color: 'white', margin: 0,
                    textShadow: `0 0 ${glow}px ${palette.primary}99, 0 0 60px ${palette.primary}33, 0 4px 24px rgba(0,0,0,0.6)`,
                    letterSpacing: '-1.5px', lineHeight: 1.18, maxWidth: 820,
                }}>{title}</h1>
                <div style={{
                    width: lineW, height: 3, margin: '16px auto', borderRadius: 2,
                    background: `linear-gradient(90deg, transparent, ${palette.primary}, ${palette.secondary}, transparent)`,
                    boxShadow: `0 0 12px ${palette.primary}88`,
                }} />
                <p style={{
                    fontSize: 18, color: 'rgba(255,255,255,0.55)', opacity: subOp,
                    fontWeight: 400, letterSpacing: '5px', textTransform: 'uppercase',
                }}>{audience}</p>
            </div>
        </AbsoluteFill>
    );
};

const ContentScene: React.FC<{
    scene: ScreenplayScene; idx: number; palette: VideoPalette; seed: number;
    sceneDurFrames: number;
}> = ({ scene, idx, palette, seed, sceneDurFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const sceneSeed = seed + idx * 1337;

    const bgOp = interpolate(
        spring({ frame, fps, config: { damping: 20, stiffness: 60 } }),
        [0, 1], [0, 1], { extrapolateRight: 'clamp' }
    );

    // Fallback: derive duration from sceneDurFrames (minus 2s transition buffer)
    const fallbackDurSec = Math.max(8, Math.round(sceneDurFrames / fps) - 2);
    const beats = (scene.beats && scene.beats.length > 0)
        ? scene.beats
        : [{ startSec: 0, durationSec: fallbackDurSec, layout: 'list' as const, heading: '', elements: [] }];

    return (
        <AbsoluteFill style={{ background: makeBg(palette, sceneSeed), opacity: bgOp }}>
            <Particles palette={palette} count={14 + (sceneSeed % 6)} seed={sceneSeed} />
            <DecoShapes palette={palette} seed={sceneSeed + 500} />
            <Badge n={idx + 1} palette={palette} />

            {beats.map((beat, bi) => {
                const startFrame = Math.round(beat.startSec * fps);
                const durFrames = Math.round(beat.durationSec * fps);
                if (durFrames <= 0) return null;
                return (
                    <Sequence key={bi} from={startFrame} durationInFrames={durFrames}>
                        <BeatRenderer beat={beat} palette={palette} spriteUrls={scene.spriteUrls} beatDurFrames={durFrames} />
                    </Sequence>
                );
            })}

            {scene.audioUrl && (
                <Audio src={scene.audioUrl.startsWith('http') ? scene.audioUrl : staticFile(scene.audioUrl.replace(/^\//, ''))} />
            )}
            <PBar p={frame / sceneDurFrames} palette={palette} />
        </AbsoluteFill>
    );
};

const OutroScene: React.FC<{ title: string; palette: VideoPalette; seed: number }> = ({ title, palette, seed }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
    const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const lineW = interpolate(frame, [8, 40], [0, 360], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ background: makeBg(palette, seed + 77) }}>
            <Particles palette={palette} count={20} seed={seed + 77} />
            <DecoShapes palette={palette} seed={seed + 333} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${s})`, textAlign: 'center', opacity: op }}>
                <div style={{
                    fontSize: 52, fontWeight: 900, color: 'white',
                    textShadow: `0 0 50px ${palette.primary}99, 0 0 100px ${palette.primary}44`, letterSpacing: '-2px',
                }}>Great Job!</div>
                <div style={{ width: lineW, height: 2, margin: '12px auto', background: `linear-gradient(90deg, transparent, ${palette.primary}, ${palette.secondary}, transparent)`, boxShadow: `0 0 10px ${palette.primary}88` }} />
                <div style={{ marginTop: 8, fontSize: 16, color: 'rgba(255,255,255,0.45)', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase' }}>Now test your knowledge</div>
            </div>
        </AbsoluteFill>
    );
};

// ── MAIN COMPOSITION ─────────────────────────────────────────────────────

export const EduVideo: React.FC<EduVideoProps> = ({
    title = 'Educational Video',
    scenes = [],
    targetAudience = 'Students',
    palette,
    totalDurationSec,
}) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    const seed = hashStr(title);
    // Use passed palette, fall back to deterministic one from title hash
    const pal: VideoPalette = palette ?? getFallbackPalette(seed);

    const introDur = 3 * fps;
    const outroDur = 3 * fps;

    // Calculate per-scene duration from narration word count
    const sceneDurations = scenes.map(scene => {
        // Use _durationSec if available, otherwise estimate from word count
        const wordCount = (scene.narration || '').split(/\s+/).filter(Boolean).length;
        const durSec = Math.max(10, Math.ceil(wordCount / 2.8));
        // Add 2s buffer for transitions
        return (durSec + 2) * fps;
    });

    const totalSceneFrames = sceneDurations.reduce((sum, d) => sum + d, 0);
    const total = introDur + totalSceneFrames + outroDur;

    // Calculate cumulative scene start frames
    let sceneStartFrame = introDur;
    const sceneStarts = sceneDurations.map(dur => {
        const start = sceneStartFrame;
        sceneStartFrame += dur;
        return start;
    });

    return (
        <AbsoluteFill style={{
            backgroundColor: pal.bg,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <Sequence from={0} durationInFrames={introDur}>
                <IntroScene title={title} audience={targetAudience} palette={pal} seed={seed} />
            </Sequence>

            {scenes.map((scene, i) => (
                <Sequence key={i} from={sceneStarts[i]} durationInFrames={sceneDurations[i]}>
                    <ContentScene scene={scene} idx={i} palette={pal} seed={seed} sceneDurFrames={sceneDurations[i]} />
                </Sequence>
            ))}

            <Sequence from={introDur + totalSceneFrames} durationInFrames={outroDur}>
                <OutroScene title={title} palette={pal} seed={seed} />
            </Sequence>

            <PBar p={frame / total} palette={pal} />
        </AbsoluteFill>
    );
};
