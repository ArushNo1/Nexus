import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Sequence,
} from 'remotion';

interface Scene {
    timestamp: string;
    narration: string;
    visuals: string;
}

interface EduVideoProps {
    title?: string;
    scenes?: Scene[];
    targetAudience?: string;
}

export const EduVideo: React.FC<EduVideoProps> = ({
    title = 'Educational Video',
    scenes = [],
    targetAudience = 'Students',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Calculate scene durations (roughly 15 seconds per scene)
    const sceneDuration = 15 * fps;
    const introDuration = 3 * fps;

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
            {/* Intro Sequence */}
            <Sequence from={0} durationInFrames={introDuration}>
                <IntroScene title={title} targetAudience={targetAudience} />
            </Sequence>

            {/* Scene Sequences */}
            {scenes.map((scene, index) => (
                <Sequence
                    key={index}
                    from={introDuration + index * sceneDuration}
                    durationInFrames={sceneDuration}
                >
                    <SceneComponent scene={scene} sceneNumber={index + 1} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};

const IntroScene: React.FC<{ title: string; targetAudience: string }> = ({
    title,
    targetAudience,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame,
        fps,
        config: {
            damping: 100,
        },
    });

    const opacity = interpolate(frame, [0, 30], [0, 1]);

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px',
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    opacity,
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontSize: '72px',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontSize: '24px',
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: '20px',
                    }}
                >
                    For {targetAudience}
                </p>
            </div>
        </AbsoluteFill>
    );
};

const SceneComponent: React.FC<{ scene: Scene; sceneNumber: number }> = ({
    scene,
    sceneNumber,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame,
        fps,
        config: {
            damping: 200,
        },
    });

    const translateX = interpolate(slideIn, [0, 1], [-1000, 0]);

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px',
            }}
        >
            {/* Scene Number Badge */}
            <div
                style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                }}
            >
                {sceneNumber}
            </div>

            {/* Visual Description (Top Section) */}
            <div
                style={{
                    transform: `translateX(${translateX}px)`,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '40px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        maxWidth: '900px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '20px',
                            color: '#a8dadc',
                            marginBottom: '10px',
                            fontWeight: '600',
                        }}
                    >
                        Visual:
                    </div>
                    <div
                        style={{
                            fontSize: '32px',
                            color: 'white',
                            lineHeight: '1.4',
                        }}
                    >
                        {scene.visuals}
                    </div>
                </div>
            </div>

            {/* Narration (Bottom Section) */}
            <div
                style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '15px',
                    padding: '30px',
                    borderLeft: '5px solid #667eea',
                }}
            >
                <div
                    style={{
                        fontSize: '24px',
                        color: 'white',
                        lineHeight: '1.6',
                    }}
                >
                    {scene.narration}
                </div>
            </div>
        </AbsoluteFill>
    );
};
