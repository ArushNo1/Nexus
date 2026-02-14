import { NextRequest, NextResponse } from 'next/server';

// ── Schema Definition ──────────────────────────────────────────────────────
const LESSON_PLAN_SCHEMA = {
    lessonPlan: {
        title: "String",
        duration: "String",
        gradeLevel: "String",
        subject: "String",
        objectives: ["String"],
        standards: ["String"],
        materials: ["String"],
        content: {
            introduction: "String",
            procedure: "String",
            closure: "String"
        }
    },
    rubrics: {
        title: "String",
        criteria: [
            {
                category: "String",
                description: "String",
                points: "Number"
            }
        ]
    },
    assessments: [
        {
            type: "String (quiz/test/assignment)",
            title: "String",
            questions: [
                {
                    questionText: "String",
                    options: ["String"],
                    correctAnswer: "String",
                    points: "Number"
                }
            ]
        }
    ]
};

// ── Text Extraction (Multi-format) ─────────────────────────────────────────
async function extractText(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();

    // PDF
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        // @ts-ignore
        const pdfParse = require('pdf-parse');
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdfParse(buffer);
        return data.text;
    }

    // PPTX / DOCX (Office formats)
    if (fileName.endsWith('.pptx') || fileName.endsWith('.docx') || fileName.endsWith('.xlsx')) {
        // @ts-ignore
        const officeParser = require('officeparser');
        const buffer = Buffer.from(await file.arrayBuffer());
        return await officeParser.parseOfficeAsync(buffer);
    }

    // Plain text fallback: TXT, MD, JSON, CSV, etc.
    return await file.text();
}

// ── LLM Parsing (Gemini) ──────────────────────────────────────────────────
async function parseWithLLM(text: string, fileName: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null; // No key → fall back to basic parsing

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
  "rubrics": {
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

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

        if (!response.ok) {
            console.error('Gemini API error:', response.status, await response.text());
            return null;
        }

        const result = await response.json();
        const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) return null;

        // Parse the JSON response
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('LLM parsing error:', error);
        return null;
    }
}

// ── Basic Fallback Parsing (No LLM) ───────────────────────────────────────
function parseBasic(text: string, fileName: string): any {
    // Helper to find a value after a label
    const findValue = (pattern: RegExp): string => {
        const match = text.match(pattern);
        return match?.[1]?.replace(/\*+/g, '').trim() || "";
    };

    // Helper to extract a section between two headers
    const findSection = (startKeywords: string[], endKeywords: string[]): string => {
        const startPattern = new RegExp(
            `(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:\\*{0,2})(?:${startKeywords.join('|')})(?:\\*{0,2})[:\\s]*(?:\\([^)]*\\))?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:#{1,6}\\s*)?(?:\\*{0,2})(?:${endKeywords.join('|')})|$)`,
            'i'
        );
        const match = text.match(startPattern);
        return match?.[1]?.trim() || "";
    };

    // Helper to extract list items from a section
    const findList = (startKeywords: string[], endKeywords: string[]): string[] => {
        const section = findSection(startKeywords, endKeywords);
        if (!section) return [];
        return section
            .split(/\r?\n/)
            .map(line => line.replace(/^[\s\-*•\d.]+/, '').replace(/\*+/g, '').trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
    };

    const title = findValue(/(?:Title|Topic|Lesson\s*(?:Plan)?|Subject)[:\s]+(.+)/i)
        || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    const duration = findValue(/(?:Duration|Time|Length)[:\s]+(.+)/i) || "Unknown";
    const gradeLevel = findValue(/(?:Grade|Level|Year)[:\s]+(.+)/i) || "Unknown";
    const subject = findValue(/(?:Subject|Course|Area)[:\s]+(.+)/i) || "Unknown";

    const allSectionEnds = ['Objectives', 'Goals', 'Standards', 'Materials', 'Resources',
        'Procedures', 'Introduction', 'Activity', 'Assessment', 'Rubric',
        'Closure', 'Conclusion', 'Content', 'Procedure'];

    const objectives = findList(['Objectives', 'Goals', 'Aims', 'Learning Outcomes'], allSectionEnds);
    const standards = findList(['Standards', 'NGSS', 'Common Core'], allSectionEnds);
    const materials = findList(['Materials', 'Resources', 'Equipment', 'Supplies'], allSectionEnds);

    const introduction = findSection(['Introduction', 'Hook', 'Opening', 'Warm-up', 'Warm Up'],
        ['Procedure', 'Activity', 'Body', 'Closure', 'Conclusion', 'Assessment', 'Rubric']);
    const procedure = findSection(['Procedure', 'Procedures', 'Activity', 'Activities', 'Body', 'Instructions', 'Steps'],
        ['Closure', 'Conclusion', 'Wrap-up', 'Assessment', 'Rubric']);
    const closure = findSection(['Closure', 'Closing', 'Conclusion', 'Wrap-up', 'Wrap Up', 'Exit'],
        ['Assessment', 'Rubric', 'Quiz', 'Test']);

    const assessmentText = findSection(['Assessment', 'Evaluation', 'Quiz', 'Test'],
        ['Rubric']);
    const rubricText = findSection(['Rubric', 'Scoring', 'Grading Criteria'],
        ['Assessment', 'Notes', 'References']);

    return {
        lessonPlan: {
            title,
            duration,
            gradeLevel,
            subject,
            objectives: objectives.length > 0 ? objectives : ["Could not extract objectives"],
            standards: standards.length > 0 ? standards : ["Could not extract standards"],
            materials: materials.length > 0 ? materials : ["Could not extract materials"],
            content: {
                introduction: introduction || "Could not extract introduction",
                procedure: procedure || "Could not extract procedure",
                closure: closure || "Could not extract closure"
            }
        },
        rubrics: {
            title: "Extracted Rubric",
            criteria: rubricText
                ? [{ category: "Rubric Content", description: rubricText, points: 0 }]
                : []
        },
        assessments: assessmentText
            ? [{
                type: "Extracted Assessment",
                title: "Assessment",
                questions: [{ questionText: assessmentText, options: [], correctAnswer: "", points: 0 }]
            }]
            : []
    };
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

        // Step 2: Parse with LLM (preferred) or fall back to basic parsing
        let parsedData = await parseWithLLM(text, file.name);
        const usedLLM = parsedData !== null;

        if (!parsedData) {
            parsedData = parseBasic(text, file.name);
        }

        // Step 3: Return results
        return NextResponse.json({
            success: true,
            filename: file.name,
            parsingMethod: usedLLM ? 'gemini-llm' : 'regex-heuristic',
            schema: LESSON_PLAN_SCHEMA,
            data: {
                ...parsedData,
                _rawText: text
            }
        });

    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: 'Internal server error processing file' },
            { status: 500 }
        );
    }
}
