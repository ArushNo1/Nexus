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

export interface Scene {
    narration: string;
    animationType: string;
    elements: string[];
    audioUrl?: string | null;
    spriteUrls?: Record<string, string | null>;
}

export interface EduVideoProps {
    title?: string;
    scenes?: Scene[];
    targetAudience?: string;
}

// ── Deterministic Hash → Random Seed ────────────────────────────────────
// Every video gets unique colors/patterns based on title

function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}

// ── Color Generation ────────────────────────────────────────────────────

const COLOR_PALETTES = [
    ['#667eea', '#764ba2', '#f093fb'],
    ['#4facfe', '#00f2fe', '#43e97b'],
    ['#fa709a', '#fee140', '#f093fb'],
    ['#a18cd1', '#fbc2eb', '#8fd3f4'],
    ['#30cfd0', '#330867', '#667eea'],
    ['#ff9a9e', '#fecfef', '#a18cd1'],
    ['#f6d365', '#fda085', '#f5576c'],
    ['#89f7fe', '#66a6ff', '#764ba2'],
    ['#7F00FF', '#E100FF', '#00d2ff'],
    ['#fc5c7d', '#6a82fb', '#05dfd7'],
];

function generateColors(seed: number) {
    const palette = COLOR_PALETTES[seed % COLOR_PALETTES.length];
    const rand = seededRandom(seed);
    // Shuffle slightly for variety
    const offset = Math.floor(rand() * 3);
    return {
        c1: palette[(0 + offset) % 3],
        c2: palette[(1 + offset) % 3],
        c3: palette[(2 + offset) % 3],
    };
}

// ── Background Variations ───────────────────────────────────────────────

function generateBg(color: string, variant: number): string {
    const bgs = [
        `radial-gradient(ellipse at 30% 40%, ${color}33 0%, #0d0d1a 70%)`,
        `radial-gradient(ellipse at 70% 30%, ${color}33 0%, #0d0d1a 70%)`,
        `radial-gradient(ellipse at 50% 60%, ${color}33 0%, #0d0d1a 70%)`,
        `radial-gradient(ellipse at 20% 70%, ${color}33 0%, #0d0d1a 70%)`,
        `radial-gradient(ellipse at 80% 50%, ${color}33 0%, #0a0a1e 70%)`,
    ];
    return bgs[variant % bgs.length];
}

// ── Background Particles ────────────────────────────────────────────────

const Particles: React.FC<{ color: string; count: number; seed: number }> = ({ color, count, seed }) => {
    const frame = useCurrentFrame();
    const rand = seededRandom(seed);
    const dots = React.useMemo(() => {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                x: rand() * 100, y: rand() * 100,
                size: 2 + rand() * 7, speed: 0.15 + rand() * 0.6,
                phase: rand() * Math.PI * 2,
            });
        }
        return arr;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            {dots.map((d, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                    width: d.size, height: d.size, borderRadius: '50%',
                    backgroundColor: color,
                    opacity: 0.06 + Math.sin(frame * 0.025 + d.phase) * 0.03,
                    transform: `translate(${Math.cos(frame * 0.013 * d.speed + d.phase) * 12}px, ${Math.sin(frame * 0.018 * d.speed + d.phase) * 15}px)`,
                }} />
            ))}
        </>
    );
};

// ── Decorative Shapes (randomized per video) ────────────────────────────

const DecoShapes: React.FC<{ color: string; seed: number }> = ({ color, seed }) => {
    const frame = useCurrentFrame();
    const rand = seededRandom(seed + 999);
    const shapes = React.useMemo(() => {
        const arr = [];
        const count = 4 + Math.floor(rand() * 5); // 4-8 shapes
        for (let i = 0; i < count; i++) {
            arr.push({
                x: rand() * 90 + 5, y: rand() * 80 + 10,
                size: 20 + rand() * 50,
                type: Math.floor(rand() * 3), // 0=circle, 1=square, 2=diamond
                rotSpeed: (rand() - 0.5) * 1.5,
                floatAmp: 8 + rand() * 20,
                phase: rand() * Math.PI * 2,
            });
        }
        return arr;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {shapes.map((s, i) => {
                const rot = frame * s.rotSpeed;
                const yF = Math.sin(frame * 0.03 + s.phase) * s.floatAmp;
                const xF = Math.cos(frame * 0.02 + s.phase) * (s.floatAmp * 0.4);
                const baseStyle: React.CSSProperties = {
                    position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                    opacity: 0.06,
                    transform: `translate(${xF}px, ${yF}px) rotate(${rot}deg)`,
                };
                if (s.type === 0) {
                    return <div key={i} style={{ ...baseStyle, width: s.size, height: s.size, borderRadius: '50%', border: `1.5px solid ${color}` }} />;
                }
                if (s.type === 1) {
                    return <div key={i} style={{ ...baseStyle, width: s.size, height: s.size, borderRadius: 4, border: `1.5px solid ${color}` }} />;
                }
                return <div key={i} style={{ ...baseStyle, width: s.size, height: s.size, borderRadius: 4, border: `1.5px solid ${color}`, transform: `translate(${xF}px, ${yF}px) rotate(${rot + 45}deg)` }} />;
            })}
        </>
    );
};

// ── Animated Element Card (with Sprite Support) ────────────────────────

const ECard: React.FC<{
    label: string; delay: number; color: string; large?: boolean; spriteUrl?: string | null;
}> = ({ label, delay, color, large, spriteUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.5, stiffness: 100 } });
    const scale = interpolate(ent, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const opacity = interpolate(ent, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
    const yF = Math.sin((frame - delay) * 0.035) * 4;
    const sz = large ? 20 : 16;
    const pad = large ? '16px 20px' : '12px 16px';
    const imgSize = large ? 50 : 40;

    return (
        <div style={{
            transform: `scale(${scale}) translateY(${yF}px)`, opacity,
            background: `${color}18`, border: `2px solid ${color}66`, borderRadius: 16,
            padding: pad, fontSize: sz, fontWeight: 700, color: 'white',
            textAlign: 'center', backdropFilter: 'blur(8px)',
            boxShadow: `0 6px 30px ${color}25`, flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spriteUrl ? 10 : 0,
            minWidth: spriteUrl ? 120 : 'auto', maxWidth: spriteUrl ? 180 : 'auto',
        }}>
            {spriteUrl && (
                <div style={{
                    width: imgSize, height: imgSize, borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', padding: 6,
                }}>
                    <img
                        src={staticFile(spriteUrl.replace(/^\//, ''))}
                        style={{
                            maxWidth: '100%', maxHeight: '100%',
                            objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                        }}
                        alt={label}
                    />
                </div>
            )}
            <div style={{ whiteSpace: 'nowrap' }}>{label}</div>
        </div>
    );
};

// ── Animated Arrow ──────────────────────────────────────────────────────

const Arr: React.FC<{ delay: number; color: string; vertical?: boolean }> = ({ delay, color, vertical }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const p = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
    const len = interpolate(p, [0, 1], [0, 36], { extrapolateRight: 'clamp' });
    const op = interpolate(p, [0, 0.3], [0, 0.5], { extrapolateRight: 'clamp' });

    if (vertical) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op, flexShrink: 0 }}>
                <div style={{ width: 3, height: len, backgroundColor: color, borderRadius: 2 }} />
                <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color}`, opacity: p > 0.7 ? 1 : 0 }} />
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', opacity: op, flexShrink: 0 }}>
            <div style={{ width: len, height: 3, backgroundColor: color, borderRadius: 2 }} />
            <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid ${color}`, opacity: p > 0.7 ? 1 : 0 }} />
        </div>
    );
};

// ── Phase Title Overlay ─────────────────────────────────────────────────

const PhaseTitle: React.FC<{ text: string; color: string }> = ({ text, color }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
    const fadeOut = interpolate(frame, [3.5 * fps, 5 * fps], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{
            position: 'absolute', top: '38%', left: '50%',
            transform: `translate(-50%, -50%) scale(${ent})`,
            fontSize: 38, fontWeight: 900, color: 'white',
            textShadow: `0 0 30px ${color}66`, letterSpacing: '-1px',
            opacity: fadeOut, textAlign: 'center', maxWidth: '80%', zIndex: 10,
        }}>
            {text}
        </div>
    );
};

// ── Scene Badge ─────────────────────────────────────────────────────────

const Badge: React.FC<{ n: number; color: string }> = ({ n, color }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
    return (
        <div style={{
            position: 'absolute', top: 22, left: 22, display: 'flex', alignItems: 'center', gap: 8,
            transform: `scale(${ent})`, opacity: ent, zIndex: 10,
        }}>
            <div style={{
                width: 30, height: 30, borderRadius: '50%', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#0d0d1a',
            }}>{n}</div>
            <div style={{ width: 36, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        </div>
    );
};

// ── Progress Bar ────────────────────────────────────────────────────────

const PBar: React.FC<{ p: number; color: string }> = ({ p, color }) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.04)' }}>
        <div style={{ width: `${Math.min(p * 100, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
    </div>
);

// ══════════════════════════════════════════════════════════════════════════
// ANIMATION TEMPLATES
// ══════════════════════════════════════════════════════════════════════════

// ── PROCESS (A → B → C → D) ────────────────────────────────────────────

const ProcessAnim: React.FC<{ elements: string[]; color: string; seed: number; spriteUrls?: Record<string, string | null> }> = ({ elements, color, seed, spriteUrls }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    const p2 = 5 * fps;
    const p3 = 22 * fps;
    const gap = Math.floor((p3 - p2) / Math.max(elements.length, 1));
    const isP3 = frame >= p3;
    const pulse = isP3 ? 1 + Math.sin((frame - p3) * 0.07) * 0.04 : 1;

    const rand = seededRandom(seed);
    const vertical = rand() > 0.5; // randomly choose horizontal or vertical layout

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%, -50%) scale(${pulse})`,
            display: 'flex', flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center', gap: 16,
            flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90%',
        }}>
            {elements.map((el, i) => {
                const d = p2 + i * gap;
                return (
                    <React.Fragment key={i}>
                        <ECard label={el} delay={d} color={color} large={i === 0 || i === elements.length - 1} spriteUrl={spriteUrls?.[el]} />
                        {i < elements.length - 1 && <Arr delay={d + Math.floor(gap * 0.5)} color={color} vertical={vertical} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ── TRANSFORMATION (Inputs ⟹ Outputs) ──────────────────────────────────

const TransformAnim: React.FC<{ elements: string[]; color: string; color2: string; seed: number; spriteUrls?: Record<string, string | null> }> = ({ elements, color, color2, seed, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mid = Math.ceil(elements.length / 2);
    const inputs = elements.slice(0, mid);
    const outputs = elements.slice(mid);
    const p2 = 5 * fps;
    const inStag = Math.floor(3 * fps / Math.max(inputs.length, 1));
    const tDelay = p2 + inputs.length * inStag + Math.floor(fps * 0.8);
    const outStart = tDelay + Math.floor(fps * 1.5);
    const outStag = Math.floor(3 * fps / Math.max(outputs.length, 1));
    const tEnt = spring({ frame: frame - tDelay, fps, config: { damping: 12, stiffness: 60 } });
    const rot = (frame - tDelay) * 0.4;
    const isP3 = frame >= 22 * fps;
    const pulse = isP3 ? 1 + Math.sin((frame - 22 * fps) * 0.07) * 0.03 : 1;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${pulse})`,
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', flex: 1, paddingLeft: 30 }}>
                {inputs.map((el, i) => <ECard key={`i${i}`} label={el} delay={p2 + i * inStag} color={color} spriteUrl={spriteUrls?.[el]} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 16px' }}>
                <Arr delay={tDelay - fps} color={color} />
                <div style={{
                    width: 60, height: 60, borderRadius: '50%', border: `3px solid ${color}`,
                    background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: 'white', boxShadow: `0 0 30px ${color}44`,
                    transform: `rotate(${rot}deg) scale(${tEnt})`, opacity: tEnt,
                }}>⟹</div>
                <Arr delay={tDelay + fps} color={color2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', flex: 1, paddingRight: 30 }}>
                {outputs.map((el, i) => <ECard key={`o${i}`} label={el} delay={outStart + i * outStag} color={color2} large spriteUrl={spriteUrls?.[el]} />)}
            </div>
        </div>
    );
};

// ── CYCLE (circular) ────────────────────────────────────────────────────

const CycleAnim: React.FC<{ elements: string[]; color: string; seed: number; spriteUrls?: Record<string, string | null> }> = ({ elements, color, seed, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const n = elements.length;
    const r = 190;
    const p2 = 5 * fps;
    const stag = Math.floor(8 * fps / Math.max(n, 1));
    const orbAngle = ((frame - p2) * 0.022) % (Math.PI * 2);
    const orbOp = interpolate(frame, [p2 + n * stag, p2 + n * stag + fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `2px dashed ${color}22` }} />
            <div style={{ position: 'absolute', left: -35, top: -35, width: 70, height: 70, borderRadius: '50%', background: `radial-gradient(circle, ${color}44, ${color}11)`, boxShadow: `0 0 40px ${color}33` }} />
            {elements.map((el, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                const ex = Math.cos(a) * r;
                const ey = Math.sin(a) * r;
                const d = p2 + i * stag;
                const ent = spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 100 } });
                const yF = Math.sin((frame - d) * 0.03) * 3;
                const spriteUrl = spriteUrls?.[el];
                return (
                    <div key={i} style={{
                        position: 'absolute', left: ex, top: ey,
                        transform: `translate(-50%, -50%) scale(${ent}) translateY(${yF}px)`, opacity: ent,
                        background: `${color}18`, border: `2px solid ${color}66`, borderRadius: 14,
                        padding: spriteUrl ? '10px 12px' : '9px 14px', fontSize: 16, fontWeight: 700, color: 'white',
                        textAlign: 'center', backdropFilter: 'blur(6px)', boxShadow: `0 4px 20px ${color}22`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spriteUrl ? 8 : 0,
                        minWidth: spriteUrl ? 100 : 'auto',
                    }}>
                        {spriteUrl && (
                            <div style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', padding: 4,
                            }}>
                                <img
                                    src={staticFile(spriteUrl.replace(/^\//, ''))}
                                    style={{
                                        maxWidth: '100%', maxHeight: '100%',
                                        objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                                    }}
                                    alt={el}
                                />
                            </div>
                        )}
                        <div style={{ whiteSpace: 'nowrap' }}>{el}</div>
                    </div>
                );
            })}
            <div style={{
                position: 'absolute', left: Math.cos(orbAngle) * r - 5, top: Math.sin(orbAngle) * r - 5,
                width: 10, height: 10, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 14px ${color}`, opacity: orbOp,
            }} />
        </div>
    );
};

// ── COMPARISON (side by side) ───────────────────────────────────────────

const CompareAnim: React.FC<{ elements: string[]; color: string; color2: string; seed: number; spriteUrls?: Record<string, string | null> }> = ({ elements, color, color2, seed, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mid = Math.ceil(elements.length / 2);
    const left = elements.slice(0, mid);
    const right = elements.slice(mid);
    const p2 = 5 * fps;
    const stag = Math.floor(2.5 * fps);
    const divH = interpolate(frame, [p2, p2 + 2 * fps], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const sideOp = interpolate(frame, [p2, p2 + fps], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 3, opacity: sideOp }}>Side A</div>
                {left.map((el, i) => <ECard key={`l${i}`} label={el} delay={p2 + fps + i * stag} color={color} spriteUrl={spriteUrls?.[el]} />)}
            </div>
            <div style={{ width: 2, height: divH, background: `linear-gradient(180deg, ${color}, ${color2})`, opacity: 0.3, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: color2, textTransform: 'uppercase', letterSpacing: 3, opacity: sideOp }}>Side B</div>
                {right.map((el, i) => <ECard key={`r${i}`} label={el} delay={p2 + 1.5 * fps + i * stag} color={color2} spriteUrl={spriteUrls?.[el]} />)}
            </div>
        </div>
    );
};

// ── LIST (numbered items) ───────────────────────────────────────────────

const ListAnim: React.FC<{ elements: string[]; color: string; seed: number; spriteUrls?: Record<string, string | null> }> = ({ elements, color, seed, spriteUrls }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const p2 = 5 * fps;
    const stag = Math.floor(10 * fps / Math.max(elements.length, 1));

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start',
        }}>
            {elements.map((el, i) => {
                const d = p2 + i * stag;
                const bEnt = spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 120 } });
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%', backgroundColor: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 800, color: '#0d0d1a',
                            transform: `scale(${bEnt})`, opacity: bEnt, flexShrink: 0,
                        }}>{i + 1}</div>
                        <ECard label={el} delay={d + 5} color={color} large spriteUrl={spriteUrls?.[el]} />
                    </div>
                );
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// SCENES
// ══════════════════════════════════════════════════════════════════════════

const IntroScene: React.FC<{ title: string; audience: string; colors: ReturnType<typeof generateColors>; seed: number }> = ({ title, audience, colors, seed }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const ent = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
    const tOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const lineW = interpolate(frame, [15, 55], [0, 450], { extrapolateRight: 'clamp' });
    const subOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
    const glow = 20 + Math.sin(frame * 0.1) * 10;

    return (
        <AbsoluteFill style={{ background: generateBg(colors.c1, seed) }}>
            <Particles color={colors.c1} count={15 + (seed % 10)} seed={seed} />
            <DecoShapes color={colors.c2} seed={seed} />
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(-50%, -50%) scale(${ent})`,
                textAlign: 'center', opacity: tOp,
            }}>
                <h1 style={{
                    fontSize: title.length > 30 ? 42 : 56, fontWeight: 900, color: 'white', margin: 0,
                    textShadow: `0 0 ${glow}px ${colors.c1}88, 0 4px 20px rgba(0,0,0,0.5)`,
                    letterSpacing: '-2px', lineHeight: 1.2, maxWidth: 800,
                }}>{title}</h1>
                <div style={{
                    width: lineW, height: 3, margin: '14px auto', borderRadius: 2,
                    background: `linear-gradient(90deg, transparent, ${colors.c1}, ${colors.c2}, transparent)`,
                }} />
                <p style={{
                    fontSize: 20, color: 'rgba(255,255,255,0.6)', opacity: subOp,
                    fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase',
                }}>{audience}</p>
            </div>
        </AbsoluteFill>
    );
};

const ContentScene: React.FC<{ scene: Scene; idx: number; colors: ReturnType<typeof generateColors>; seed: number }> = ({ scene, idx, colors, seed }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const sceneSeed = seed + idx * 1337;
    const sceneColors = [colors.c1, colors.c2, colors.c3];
    const c = sceneColors[idx % 3];
    const c2 = sceneColors[(idx + 1) % 3];
    const bgOp = interpolate(
        spring({ frame, fps, config: { damping: 20, stiffness: 60 } }),
        [0, 1], [0, 1], { extrapolateRight: 'clamp' }
    );
    const aType = scene.animationType || 'list';
    const els = scene.elements || [];
    const phaseTitle = els.slice(0, 3).join(' · ');

    return (
        <AbsoluteFill style={{ background: generateBg(c, sceneSeed), opacity: bgOp }}>
            <Particles color={c} count={12 + (sceneSeed % 8)} seed={sceneSeed} />
            <DecoShapes color={c2} seed={sceneSeed + 500} />
            <Badge n={idx + 1} color={c} />
            <PhaseTitle text={phaseTitle} color={c} />

            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: interpolate(frame, [3.5 * fps, 5 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
                {aType === 'process' && <ProcessAnim elements={els} color={c} seed={sceneSeed} spriteUrls={scene.spriteUrls} />}
                {aType === 'transformation' && <TransformAnim elements={els} color={c} color2={c2} seed={sceneSeed} spriteUrls={scene.spriteUrls} />}
                {aType === 'cycle' && <CycleAnim elements={els} color={c} seed={sceneSeed} spriteUrls={scene.spriteUrls} />}
                {aType === 'comparison' && <CompareAnim elements={els} color={c} color2={c2} seed={sceneSeed} spriteUrls={scene.spriteUrls} />}
                {aType === 'list' && <ListAnim elements={els} color={c} seed={sceneSeed} spriteUrls={scene.spriteUrls} />}
            </div>

            {scene.audioUrl && <Audio src={staticFile(scene.audioUrl.replace(/^\//, ''))} />}
            <PBar p={frame / (28 * fps)} color={c} />
        </AbsoluteFill>
    );
};

const OutroScene: React.FC<{ title: string; colors: ReturnType<typeof generateColors>; seed: number }> = ({ title, colors, seed }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
    const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ background: generateBg(colors.c3, seed + 77) }}>
            <Particles color={colors.c3} count={18} seed={seed + 77} />
            <DecoShapes color={colors.c1} seed={seed + 333} />
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(-50%, -50%) scale(${s})`,
                textAlign: 'center', opacity: op,
            }}>
                <div style={{
                    fontSize: 48, fontWeight: 900, color: 'white',
                    textShadow: `0 0 40px ${colors.c3}88`, letterSpacing: '-2px',
                }}>Great Job!</div>
                <div style={{
                    marginTop: 12, fontSize: 18, color: 'rgba(255,255,255,0.5)',
                    fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase',
                }}>Now test your knowledge</div>
            </div>
        </AbsoluteFill>
    );
};

// ── MAIN COMPOSITION ────────────────────────────────────────────────────
// Total = 90s exactly: 3s intro + 3×28s scenes + 3s outro = 90s

export const EduVideo: React.FC<EduVideoProps> = ({
    title = 'Educational Video',
    scenes = [],
    targetAudience = 'Students',
}) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    // Generate unique seed from title
    const seed = hashStr(title);
    const colors = generateColors(seed);

    const introDur = 3 * fps;   // 3s
    const sceneDur = 28 * fps;  // 28s each
    const outroDur = 3 * fps;   // 3s
    // Total: 3 + 28*3 + 3 = 90s = 2700 frames ✓

    const total = introDur + scenes.length * sceneDur + outroDur;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#0d0d1a',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <Sequence from={0} durationInFrames={introDur}>
                <IntroScene title={title} audience={targetAudience} colors={colors} seed={seed} />
            </Sequence>

            {scenes.map((scene, i) => (
                <Sequence key={i} from={introDur + i * sceneDur} durationInFrames={sceneDur}>
                    <ContentScene scene={scene} idx={i} colors={colors} seed={seed} />
                </Sequence>
            ))}

            <Sequence from={introDur + scenes.length * sceneDur} durationInFrames={outroDur}>
                <OutroScene title={title} colors={colors} seed={seed} />
            </Sequence>

            <PBar p={frame / total} color={colors.c1} />
        </AbsoluteFill>
    );
};
