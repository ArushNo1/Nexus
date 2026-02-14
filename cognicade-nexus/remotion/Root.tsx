import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { EduVideo } from './EduVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="EduVideo"
            component={EduVideo}
            durationInFrames={2700} // exactly 90 seconds (1:30) at 30fps
            fps={30}
            width={1280}
            height={720}
            defaultProps={{
                title: 'Educational Video',
                scenes: [],
                targetAudience: 'Students',
            }}
        />
    );
};

registerRoot(RemotionRoot);
