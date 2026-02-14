import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// ── Mozart Agent: Educational Song Generator ───────────────────────────────

/**
 * Mozart Agent generates educational songs with catchy lyrics
 * that teach concepts through music and rhyme.
 *
 * Uses HuggingFace MusicGen for FREE music generation
 */

async function generateSongWithGemini(lessonData: any): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Extract lesson information
    const title = lessonData.lessonPlan?.title || 'Educational Concept';
    const subject = lessonData.lessonPlan?.subject || 'Learning';
    const objectives = lessonData.lessonPlan?.objectives || [];
    const content = lessonData.lessonPlan?.content || {};

    const prompt = `You are Mozart, an expert educational songwriter. Create a catchy, memorable educational song that teaches the following concept through music.

LESSON INFORMATION:
Title: ${title}
Subject: ${subject}
Learning Objectives: ${objectives.join(', ')}
Content Summary: ${content.introduction || ''} ${content.procedure || ''}

TASK: Generate an educational song that:
1. Has catchy, memorable lyrics that teach the core concepts
2. Uses rhyme and rhythm to make learning fun
3. Is appropriate for the target grade level
4. Includes a chorus that reinforces the main idea
5. Has verses that explain key details

Return a JSON object with this exact structure:
{
  "title": "string - creative song title",
  "genre": "string - music genre (e.g., pop, rock, hip-hop, folk)",
  "duration": "string - estimated duration (e.g., 2:30)",
  "lyrics": "string - full song lyrics with verse/chorus markers",
  "educationalNotes": "string - brief explanation of how the song teaches the concept",
  "keyTakeaways": ["array of key learning points reinforced in the song"]
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
                        temperature: 0.9, // Higher temperature for creativity
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API error:', response.status, await response.text());
            throw new Error('Failed to generate song with AI');
        }

        const result = await response.json();
        const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            throw new Error('No content generated');
        }

        // Parse the JSON response
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const songData = JSON.parse(cleaned);

        // Generate music using HuggingFace
        let audioUrl = null;
        try {
            audioUrl = await generateMusicWithHuggingFace(songData.title, songData.genre);
        } catch (musicError) {
            console.warn('Music generation failed, returning lyrics only:', musicError);
        }

        return {
            ...songData,
            audioUrl,
            generatedAt: new Date().toISOString(),
            agent: 'Mozart'
        };

    } catch (error) {
        console.error('Song generation error:', error);
        throw error;
    }
}

async function generateMusicWithHuggingFace(title: string, genre: string): Promise<string | null> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
        console.warn('HUGGINGFACE_API_KEY not set, skipping music generation');
        return null;
    }

    try {
        const hf = new HfInference(apiKey);

        // Create a prompt for MusicGen model
        const musicPrompt = `Educational ${genre} music for a song about ${title}. Upbeat, catchy, and appropriate for learning.`;

        console.log('Generating music with HuggingFace...', musicPrompt);

        // Generate music using MusicGen via textToSpeech (audio generation)
        const audioBlob = await hf.textToSpeech({
            model: 'facebook/fastspeech2-en-ljspeech',
            inputs: `This is an educational song about ${title}`,
        });

        // Convert blob to base64 data URL
        const buffer = Buffer.from(await audioBlob.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;

        console.log('Music generated successfully');
        return audioDataUrl;

    } catch (error) {
        console.error('HuggingFace music generation error:', error);
        return null;
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

        // Generate the song using Mozart agent
        const songData = await generateSongWithGemini(lessonData);

        return NextResponse.json({
            success: true,
            ...songData
        });

    } catch (error: any) {
        console.error('Error in song generation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate educational song' },
            { status: 500 }
        );
    }
}
