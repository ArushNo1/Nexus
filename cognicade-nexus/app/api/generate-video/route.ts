import { NextRequest, NextResponse } from 'next/server';

// ── Edison Agent: Educational Video Generator ──────────────────────────────

/**
 * Edison Agent generates educational videos with narration scripts
 * that visually explain concepts through structured lessons.
 *
 * Uses Remotion for video rendering (requires server setup for full rendering)
 * Currently returns video script and preview data
 */

async function generateVideoWithGemini(lessonData: any): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Extract lesson information
    const title = lessonData.lessonPlan?.title || 'Educational Concept';
    const subject = lessonData.lessonPlan?.subject || 'Learning';
    const objectives = lessonData.lessonPlan?.objectives || [];
    const content = lessonData.lessonPlan?.content || {};
    const gradeLevel = lessonData.lessonPlan?.gradeLevel || 'General';

    const prompt = `You are Edison, an expert educational video director. Create a compelling educational video script that teaches the following concept through visual storytelling.

LESSON INFORMATION:
Title: ${title}
Subject: ${subject}
Grade Level: ${gradeLevel}
Learning Objectives: ${objectives.join(', ')}
Introduction: ${content.introduction || ''}
Main Content: ${content.procedure || ''}
Closure: ${content.closure || ''}

TASK: Generate an educational video script that:
1. Opens with an engaging hook to capture attention
2. Clearly explains the concept with visual descriptions
3. Uses analogies and real-world examples
4. Includes suggested visuals/animations for each section
5. Ends with a summary and call-to-action

The video should be 3-5 minutes long and appropriate for the grade level.

Return a JSON object with this exact structure:
{
  "title": "string - engaging video title",
  "duration": "string - estimated duration (e.g., 4:15)",
  "targetAudience": "string - who this video is for",
  "script": "string - full narration script with [VISUAL: description] markers for animations/graphics",
  "scenes": [
    {
      "timestamp": "string - e.g., 0:00-0:30",
      "narration": "string - what the narrator says",
      "visuals": "string - description of what appears on screen"
    }
  ],
  "keyTakeaways": ["array of main learning points"],
  "suggestedAnimations": ["array of animation/graphic suggestions"]
}

IMPORTANT: Return ONLY the JSON object, no markdown code fences.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API error:', response.status, await response.text());
            throw new Error('Failed to generate video with AI');
        }

        const result = await response.json();
        const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            throw new Error('No content generated');
        }

        // Parse the JSON response
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const videoData = JSON.parse(cleaned);

        // Video rendering setup note:
        // For full video rendering, you can use Remotion components in /remotion/EduVideo.tsx
        // Run: npx remotion render remotion/Root.tsx EduVideo output.mp4 --props='{"title":"...","scenes":[...]}'

        return {
            ...videoData,
            videoUrl: null, // Video rendering requires server setup (see remotion/ folder)
            thumbnailUrl: null,
            generatedAt: new Date().toISOString(),
            agent: 'Edison',
            renderingNote: 'Video script generated. To render video, use Remotion CLI or set up server-side rendering.',
            remotionProps: {
                title: videoData.title,
                scenes: videoData.scenes,
                targetAudience: videoData.targetAudience
            }
        };

    } catch (error) {
        console.error('Video generation error:', error);
        throw error;
    }
}

// ── API Route Handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lessonData } = body;

        if (!lessonData) {
            return NextResponse.json(
                { error: 'Lesson data is required' },
                { status: 400 }
            );
        }

        // Generate the video using Edison agent
        const videoData = await generateVideoWithGemini(lessonData);

        return NextResponse.json({
            success: true,
            ...videoData
        });

    } catch (error: any) {
        console.error('Error in video generation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate educational video' },
            { status: 500 }
        );
    }
}
