import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const GAME_AGENT_URL =
  process.env.GAME_AGENT_URL || "http://143.198.30.138:8000";
const GAME_AGENT_API_KEY = process.env.GAME_AGENT_API_KEY || "";

interface GenerateGameRequest {
  lesson_plan: Record<string, unknown>;
  lesson_id: string;
  title: string;
  target_audience?: string;
}

export async function POST(req: NextRequest) {
  try {
    // SSR client reads cookies → verifies the logged-in user
    const authClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Service role client bypasses RLS for the insert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SERVICE_ROLE_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body: GenerateGameRequest = await req.json();
    const { lesson_plan, lesson_id, title, target_audience } = body;

    if (!lesson_plan || !lesson_id || !title) {
      return NextResponse.json(
        { error: "Missing required fields: lesson_plan, lesson_id, title" },
        { status: 400 }
      );
    }

    // Insert a new row into the games table
    const { data: game, error: insertError } = await supabase
      .from("games")
      .insert({
        lesson_id,
        user_id: user.id,
        title,
        target_audience: target_audience || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !game) {
      console.error("Failed to insert game row:", insertError);
      return NextResponse.json(
        { error: "Failed to create game record" },
        { status: 500 }
      );
    }

    // Fire-and-forget call to the DigitalOcean game agent
    fetch(`${GAME_AGENT_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GAME_AGENT_API_KEY}`,
      },
      body: JSON.stringify({
        lesson_plan,
        user_id: user.id,
        id: game.id,
      }),
    }).catch((err) => {
      console.error("Failed to call game agent:", err);
    });

    return NextResponse.json({
      success: true,
      game_id: game.id,
      status: "pending",
    });
  } catch (err) {
    console.error("generate-game error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
