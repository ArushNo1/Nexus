import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { EduVideo, EduVideoProps } from './EduVideo';

const calculateDurationFromProps = (props: EduVideoProps): number => {
    const fps = 30;
    const introDur = 3 * fps; // 3s intro
    const outroDur = 3 * fps; // 3s outro

    const sceneDurations = (props.scenes || []).map(scene => {
        const wordCount = (scene.narration || '').split(/\s+/).filter(Boolean).length;
        const durSec = Math.max(10, Math.ceil(wordCount / 2.8));
        return (durSec + 2) * fps; // +2s for transitions
    });

    const totalSceneFrames = sceneDurations.reduce((sum, d) => sum + d, 0);
    return introDur + totalSceneFrames + outroDur;
};

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="EduVideo"
            component={EduVideo}
            durationInFrames={900}
            fps={30}
            width={1280}
            height={720}
            defaultProps={{
                title: 'Educational Video',
                scenes: [
                    {
                        narration: 'Welcome to this educational video. Today we will learn something amazing together.',
                        beats: [
                            { startSec: 0, durationSec: 10, layout: 'focus' as const, heading: 'Introduction', elements: ['Learning', 'Knowledge'] }
                        ],
                        audioUrl: null,
                        spriteUrls: {},
                    }
                ],
                targetAudience: 'Students',
            }}
            calculateMetadata={async ({ props }) => {
                const duration = calculateDurationFromProps(props as EduVideoProps);
                return {
                    durationInFrames: Math.max(300, duration), // minimum 10s
                };
            }}
        />
    );
};

registerRoot(RemotionRoot);
