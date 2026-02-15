import { NextRequest, NextResponse } from 'next/server';

// ── TypeScript Interfaces ──────────────────────────────────────────────────

interface LessonContent {
    introduction: string;
    procedure: string;
    closure: string;
}

interface LessonPlan {
    title: string;
    duration: string;
    gradeLevel: string;
    subject: string;
    objectives: string[];
    standards: string[];
    materials: string[];
    content: LessonContent;
}

interface RubricCriterion {
    category: string;
    description: string;
    points: number;
}

interface Rubric {
    title: string;
    criteria: RubricCriterion[];
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    points: number;
}

interface Assessment {
    type: string;
    title: string;
    questions: Question[];
}

interface ParsedLessonData {
    lessonPlan: LessonPlan;
    rubric: Rubric;
    assessments: Assessment[];
}

// ── Schema Validation ──────────────────────────────────────────────────────

function validateParsedData(data: any): data is ParsedLessonData {
    if (!data || typeof data !== 'object') return false;

    // Validate lessonPlan
    if (!data.lessonPlan || typeof data.lessonPlan !== 'object') return false;
    const lp = data.lessonPlan;
    if (typeof lp.title !== 'string' ||
        typeof lp.duration !== 'string' ||
        typeof lp.gradeLevel !== 'string' ||
        typeof lp.subject !== 'string') return false;

    if (!Array.isArray(lp.objectives) || !Array.isArray(lp.standards) || !Array.isArray(lp.materials)) {
        return false;
    }

    if (!lp.content || typeof lp.content !== 'object' ||
        typeof lp.content.introduction !== 'string' ||
        typeof lp.content.procedure !== 'string' ||
        typeof lp.content.closure !== 'string') {
        return false;
    }

    // Validate rubric
    if (!data.rubric || typeof data.rubric !== 'object') return false;
    if (typeof data.rubric.title !== 'string' || !Array.isArray(data.rubric.criteria)) {
        return false;
    }

    // Validate assessments
    if (!Array.isArray(data.assessments)) return false;

    return true;
}

// ── Text Extraction (Multi-format) ─────────────────────────────────────────

async function extractText(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();

    // PDF
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        // @ts-ignore
        const { PDFParse } = require('pdf-parse');
        const buffer = Buffer.from(await file.arrayBuffer());
        const parser = new PDFParse({ data: buffer, verbosity: 0 });
        const result = await parser.getText();
        return result.text;
    }

    // PPTX / DOCX (Office formats)
    if (fileName.endsWith('.pptx') || fileName.endsWith('.docx') || fileName.endsWith('.xlsx')) {
        // @ts-ignore
        const { parseOffice } = require('officeparser');
        const buffer = Buffer.from(await file.arrayBuffer());
        return await parseOffice(buffer);
    }

    // Plain text fallback: TXT, MD, JSON, CSV, etc.
    return await file.text();
}

// ── Gemini Model List (fallback chain) ────────────────────────────────────

const GEMINI_MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
];

// ── LLM Parsing (Gemini with model fallback) ──────────────────────────────

async function parseWithLLM(text: string, fileName: string): Promise<ParsedLessonData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const prompt = `You are an expert at parsing educational documents.
Analyze the following text extracted from a file called "${fileName}" and return a VALID JSON object with the following structure.
Fill in every field as accurately as possible from the text. If a field cannot be determined, use a sensible default or an empty array.

Required JSON structure:
{
  "lessonPlan": {
    "title": "string - the lesson title",
    "duration": "string - how long the lesson takes",
    "gradeLevel": "string - the grade level",
    "subject": "string - the subject area",
    "objectives": ["string - each learning objective"],
    "standards": ["string - each standard referenced"],
    "materials": ["string - each material needed"],
    "content": {
      "introduction": "string - the opening/hook activity",
      "procedure": "string - the main teaching procedure/activity",
      "closure": "string - the closing/wrap-up activity"
    }
  },
  "rubric": {
    "title": "string - rubric title",
    "criteria": [
      { "category": "string", "description": "string", "points": number }
    ]
  },
  "assessments": [
    {
      "type": "string - quiz, test, or assignment",
      "title": "string",
      "questions": [
        { "questionText": "string", "options": ["string"], "correctAnswer": "string", "points": number }
      ]
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown code fences, no explanation.

Here is the document text:
---
${text.substring(0, 15000)}
---`;

    const errors: string[] = [];

    for (const model of GEMINI_MODELS) {
        try {
            console.log(`[parse-lesson] Trying model: ${model}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            if (response.status === 429) {
                console.warn(`[parse-lesson] Rate limited on ${model}, trying next model...`);
                errors.push(`${model}: rate limited (429)`);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[parse-lesson] Gemini API error (${model}):`, response.status, errorText);
                errors.push(`${model}: API error ${response.status}`);
                continue;
            }

            const result = await response.json();
            const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                console.warn(`[parse-lesson] No content from ${model}, trying next...`);
                errors.push(`${model}: no content returned`);
                continue;
            }

            // Parse the JSON response
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsedData = JSON.parse(cleaned);

            // Validate the parsed data
            if (!validateParsedData(parsedData)) {
                console.warn(`[parse-lesson] Validation failed for ${model} output, trying next...`);
                errors.push(`${model}: validation failed`);
                continue;
            }

            console.log(`[parse-lesson] Successfully parsed with ${model}`);
            return parsedData;
        } catch (error: any) {
            console.error(`[parse-lesson] Error with model ${model}:`, error.message);
            errors.push(`${model}: ${error.message}`);
            continue;
        }
    }

    throw new Error(
        `All Gemini models failed. Errors: ${errors.join('; ')}. ` +
        'You may have exceeded your API quota. Please try again later or check your billing at https://ai.google.dev/gemini-api/docs/rate-limits'
    );
}

// ── API Route Handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Step 1: Extract text from file
        let text = '';
        try {
            text = await extractText(file);
        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            return NextResponse.json(
                { error: `Failed to extract text from ${file.name}. Is the file format supported?` },
                { status: 422 }
            );
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'No text content could be extracted from the file.' },
                { status: 422 }
            );
        }

        // Step 2: Parse with LLM
        try {
            const parsedData = await parseWithLLM(text, file.name);

            // Step 3: Return results
            return NextResponse.json({
                success: true,
                filename: file.name,
                data: parsedData,
                schema: {
                    type: "ParsedLessonData",
                    description: "Structured lesson plan with rubric and assessments"
                }
            });
        } catch (parseError: any) {
            console.error('Parsing error:', parseError);
            return NextResponse.json(
                {
                    error: 'Failed to parse lesson plan',
                    details: parseError.message
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: 'Internal server error processing file' },
            { status: 500 }
        );
    }
}
