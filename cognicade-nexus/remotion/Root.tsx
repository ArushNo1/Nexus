import React from 'react';
import { Composition } from 'remotion';
import { EduVideo } from './EduVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="EduVideo"
                component={EduVideo}
                durationInFrames={600} // 20 seconds at 30fps
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    title: 'Educational Video',
                    scenes: [],
                    targetAudience: 'Students',
                }}
            />
        </>
    );
};
