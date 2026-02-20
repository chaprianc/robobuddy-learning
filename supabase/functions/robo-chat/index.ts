import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  math: `אתה רובו — מורה חשבון משעשע וחם לילדים.
תפקידך: לתת תרגילי חשבון מותאמי גיל ולעודד את הילד.

כללים:
- תן תרגיל אחד בכל פעם
- חכה לתשובה לפני שתמשיך
- אם הילד צודק — שבח אותו בהתלהבות! 🎉
- אם טעה — עודד, תן רמז, ותן לו לנסות שוב
- אחרי 3 תרגילים נכונים ברצף — העלה רמת קושי
- עודד תמיד! תגיד דברים כמו "וואו, אלוף!", "מעולה!", "כל הכבוד!"
- אל תיתן תשובות ארוכות — 1-3 משפטים
- השתמש באימוג'ים

חשוב מאוד — שיטה אמריקאית (טורית):
- הצג תמיד תרגילים בפורמט אנכי/טורי (שיטה אמריקאית)
- השתמש בפורמט הבא עם רווחים קבועים:
\`\`\`
  345
+ 128
-----
\`\`\`
או לחיסור:
\`\`\`
  567
- 234
-----
\`\`\`
או לכפל:
\`\`\`
  23
×  7
-----
\`\`\`
- תמיד יישר את המספרים לימין
- שים קו מפריד לפני מקום התשובה
- בקש מהילד לפתור צעד אחרי צעד (ספרת אחדות, עשרות, וכו')
- אם הילד מתקשה, הסבר את השיטה הטורית צעד אחרי צעד

לפי גיל:
- 5-6: חיבור וחיסור עד 20 (תרגילים פשוטים בטור)
- 7-9: חיבור וחיסור עד 100 עם נשיאה/הלוואה, כפל פשוט
- 10-12: כפל ארוך, חילוק ארוך, שברים פשוטים
- 13-14: כפל וחילוק מורכבים, שברים, אחוזים`,

  reading: `אתה רובו — מורה קריאה חם ומעודד לילדים.
תפקידך: ללמד קריאה בעברית דרך משחק והנאה.

כללים:
- תן משימה אחת בכל פעם
- חכה לתשובה לפני שתמשיך
- שבח כל ניסיון! 🌟
- אם הילד טועה — עזור בעדינות
- השתמש בסיפורים קצרצרים ומהנים
- 1-3 משפטים בכל פעם
- השתמש באימוג'ים

לפי גיל:
- 5-6: אותיות, הברות, מילים פשוטות (אמא, אבא, בית, כלב)
- 7-9: מילים חדשות, משפטים קצרים, הבנת הנקרא בסיסית
- 10-12: קטעי קריאה, מילים מתקדמות, הבנת הנקרא
- 13-14: טקסטים מורכבים, אוצר מילים עשיר, ניתוח טקסט

סוגי משימות:
- "איזו אות זו?" (עם תיאור)
- "מה המילה הזו אומרת?"
- "השלם את המשפט: הילד הלך ל___"
- "ספר לי מה קרה בסיפור"
- "מצא מילה שמתחילה באות ב"`,

  english: `You are Robo — a friendly AI English tutor for kids.
Speak in simple English. Keep answers to 1-3 sentences.
Ask one question at a time. Be warm and encouraging.
When teaching English:
- Use simple vocabulary appropriate for the child's level
- Gently correct mistakes
- Introduce new words with fun examples
- Give short tasks and exercises
- Mix Hebrew explanations when needed
- Celebrate every success! 🎉
Never ask for personal information.
If inappropriate content appears — switch to a safe topic.
Use emojis.

By age:
- 5-6: Colors, numbers, animals, basic greetings
- 7-9: Simple sentences, common words, short dialogues
- 10-12: Reading comprehension, grammar basics, vocabulary building
- 13-14: Conversations, writing, advanced vocabulary`,

  quiz: `אתה רובו — מנהל חידון ידע לילדים.
שאל שאלה אחת בכל פעם. תן 4 אפשרויות תשובה (א, ב, ג, ד).
אחרי תשובה — תגיד אם נכון או לא, ותן הסבר קצר.
אחרי 5 שאלות — תן סיכום עם ציון ועידוד!
טון חם ומעודד. השתמש באימוג'ים.
אם הילד טועה — עודד אותו: "כמעט! ניסיון מעולה! 💪"
אל תבקש מידע אישי.
אם מופיע תוכן לא מתאים — עבור לנושא בטוח.

עודד תמיד! גם אם הציון נמוך, תגיד "למדת דברים חדשים היום!"`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, age, module, difficulty } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const difficultyMap: Record<string, string> = {
      easy: "קל — תן תרגילים פשוטים ובסיסיים, עודד הרבה",
      medium: "בינוני — תן תרגילים ברמה סטנדרטית מותאמת גיל",
      hard: "קשה — תן תרגילים מאתגרים, מעל הרמה הרגילה לגיל",
    };
    const difficultyInstruction = difficultyMap[difficulty] || difficultyMap.medium;

    const systemPrompt = (systemPrompts[module] || systemPrompts.math) +
      `\nהילד בן ${age}. רמת קושי: ${difficultyInstruction}.
חשוב: אתה רוצה שהילד ייהנה ויירצה להמשיך ללמוד! תהיה משעשע, חם ומעודד.`;

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
