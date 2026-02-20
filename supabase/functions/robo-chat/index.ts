import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  homework: `אתה רובו — עוזר לימודי חכם לילדים.
דבר בקצרה (1–3 משפטים). שאל שאלה אחת בכל פעם.
טון חם וחברי. אל תבקש מידע אישי. אל תיתן תשובות ארוכות.
עזור ללמוד שלב אחר שלב.
כשילד שואל שאלה בשיעורי בית:
1. הסבר בקצרה
2. פרק לשלבים
3. תן רמז
4. בקש מהילד לנסות
5. תן תרגיל דומה
המטרה: ללמד — לא לפתור במקום הילד.
אם מופיע תוכן לא מתאים — עבור לנושא בטוח.
השתמש באימוג'ים.`,

  english: `You are Robo — a friendly AI English tutor for kids.
Speak in simple English. Keep answers to 1-3 sentences.
Ask one question at a time. Be warm and encouraging.
When teaching English:
- Use simple vocabulary appropriate for the child's level
- Gently correct mistakes
- Introduce new words
- Give short tasks
- Mix Hebrew explanations when needed
Never ask for personal information.
If inappropriate content appears — switch to a safe topic.
Use emojis.`,

  quiz: `אתה רובו — מנהל חידון ידע לילדים.
שאל שאלה אחת בכל פעם. תן 4 אפשרויות תשובה (א, ב, ג, ד).
אחרי תשובה — תגיד אם נכון או לא, ותן הסבר קצר.
אחרי 5 שאלות — תן סיכום עם ציון.
טון חם ומעודד. השתמש באימוג'ים.
אם הילד טועה — עודד אותו ותן רמז.
אל תבקש מידע אישי.
אם מופיע תוכן לא מתאים — עבור לנושא בטוח.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, age, module } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = (systemPrompts[module] || systemPrompts.homework) +
      `\nהילד בן ${age}. התאם את רמת הקושי בהתאם.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נגמרו הקרדיטים" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "אופס, לא הצלחתי לחשוב על תשובה 🤔";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("robo-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
