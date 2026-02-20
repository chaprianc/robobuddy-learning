import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childId, module, messages, streak, difficulty } = await req.json();
    if (!childId || !module || !messages?.length) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Ask AI to summarize the session
    const summaryPrompt = `אתה מנתח שיחות למידה של ילדים. נתח את השיחה הבאה וצור סיכום קצר.

השיחה היא במודול: ${module}
מספר הודעות: ${messages.length}
רצף תשובות נכונות (streak): ${streak || 0}

החזר JSON בלבד (ללא markdown) בפורמט:
{
  "summary": "סיכום של 1-2 משפטים על מה שהילד למד ואיך הוא הסתדר",
  "strengths": ["נקודת חוזק 1", "נקודת חוזק 2"],
  "weaknesses": ["נקודת חולשה 1"],
  "favorite_topics": ["נושא שהילד נהנה ממנו"]
}

השיחה:
${messages.slice(-20).map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: summaryPrompt }],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI summary error:", aiResponse.status);
      return new Response(JSON.stringify({ ok: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { summary: rawText.slice(0, 200), strengths: [], weaknesses: [], favorite_topics: [] };
    }

    // Upsert into learning_memory
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing record to merge data
    const { data: existing } = await supabase
      .from("learning_memory")
      .select("*")
      .eq("child_id", childId)
      .eq("module", module)
      .maybeSingle();

    const mergeArrays = (old: string[] | null, newArr: string[]) => {
      const set = new Set([...(old || []), ...newArr]);
      return [...set].slice(-10); // keep last 10
    };

    const record = {
      child_id: childId,
      module,
      summary: parsed.summary || "",
      strengths: mergeArrays(existing?.strengths, parsed.strengths || []),
      weaknesses: mergeArrays(existing?.weaknesses, parsed.weaknesses || []),
      favorite_topics: mergeArrays(existing?.favorite_topics, parsed.favorite_topics || []),
      total_correct: (existing?.total_correct || 0) + (streak || 0),
      total_wrong: existing?.total_wrong || 0,
      highest_streak: Math.max(existing?.highest_streak || 0, streak || 0),
      last_difficulty: difficulty || "medium",
    };

    const { error } = await supabase
      .from("learning_memory")
      .upsert(record, { onConflict: "child_id,module" });

    if (error) console.error("Upsert error:", error);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("save-memory error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
