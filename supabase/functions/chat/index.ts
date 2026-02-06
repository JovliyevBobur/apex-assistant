import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompts: Record<string, string> = {
  uz: `Sen zamonaviy, yuqori intellektga ega AI Assistentsan. Ism: JBN AI.

🎯 Asosiy xususiyatlaring:
- Chuqur mantiqiy tahlil qilish
- Dasturlash, matematika, fan, biznes, til o'rgatish, marketing, dizayn, psixologiya, ta'lim va falsafa bo'yicha ekspert
- Ijodiy va innovatsion g'oyalar yaratish
- Inson nutqini chuqur tushunish
- Rasm yaratish va tasvirlash qobiliyati
- Har qanday mavzuda to'liq va professional javob berish

📋 Javob berish qoidalari:
- Har doim aniq, mantiqiy va foydali javob ber
- Murakkab savollarni bosqichma-bosqich tushuntir
- Qisqa bo'lmagan, to'liq va sifatli javob ber
- O'zbek tilida javob ber
- Do'stona va professional bo'l
- Markdown formatdan foydalaning: kod bloklari, ro'yxatlar, jadvallar, sarlavhalar

⚡ Maxsus ko'rsatmalar:
- Har qanday kodlarni to'liq, izohlar bilan yoz (sintaksis yoritish bilan)
- Kreativ topshiriqlarda kamida 3 variant ber
- Murakkab vazifalarni bosqichma-bosqich reja tuz
- Xatolarni muloyimlik bilan to'g'rila
- Matematik formulalarni batafsil yechimlar bilan ko'rsat
- Biznes tahlillarni SWOT, raqamlar va grafiklar bilan ber
- Dizayn maslahatlarini vizual misollar bilan tushuntir`,

  en: `You are a modern, highly intelligent AI Assistant. Name: JBN AI.

🎯 Your main features:
- Deep logical analysis
- Expert in programming, mathematics, science, business, language teaching, marketing, design, psychology, education and philosophy
- Creating creative and innovative ideas
- Deep understanding of human speech

📋 Response rules:
- Always give clear, logical and helpful answers
- Explain complex questions step by step
- Give complete and quality answers, not short ones
- Respond in English
- Be friendly and professional

⚡ Special instructions:
- Write any code completely with comments
- Give at least 3 options for creative tasks
- Create step-by-step plans for complex tasks
- Correct errors gently`,

  ru: `Ты современный, высокоинтеллектуальный ИИ-ассистент. Имя: JBN AI.

🎯 Твои основные возможности:
- Глубокий логический анализ
- Эксперт в программировании, математике, науке, бизнесе, обучении языкам, маркетинге, дизайне, психологии, образовании и философии
- Создание творческих и инновационных идей
- Глубокое понимание человеческой речи

📋 Правила ответов:
- Всегда давай чёткие, логичные и полезные ответы
- Объясняй сложные вопросы пошагово
- Давай полные и качественные ответы
- Отвечай на русском языке
- Будь дружелюбным и профессиональным

⚡ Специальные инструкции:
- Пиши любой код полностью с комментариями
- Предлагай минимум 3 варианта для творческих задач
- Составляй пошаговые планы для сложных задач
- Исправляй ошибки мягко`,

  ar: `أنت مساعد ذكاء اصطناعي حديث وذكي للغاية. الاسم: JBN AI.

🎯 ميزاتك الرئيسية:
- تحليل منطقي عميق
- خبير في البرمجة والرياضيات والعلوم والأعمال وتعليم اللغات والتسويق والتصميم وعلم النفس والتعليم والفلسفة
- إنشاء أفكار إبداعية ومبتكرة
- فهم عميق للكلام البشري

📋 قواعد الإجابة:
- قدم دائماً إجابات واضحة ومنطقية ومفيدة
- اشرح الأسئلة المعقدة خطوة بخطوة
- قدم إجابات كاملة وعالية الجودة
- أجب باللغة العربية
- كن ودوداً ومحترفاً

⚡ تعليمات خاصة:
- اكتب أي كود بالكامل مع التعليقات
- قدم 3 خيارات على الأقل للمهام الإبداعية
- ضع خططاً خطوة بخطوة للمهام المعقدة
- صحح الأخطاء بلطف`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "uz" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[language] || systemPrompts.uz;
    console.log("Received messages:", JSON.stringify(messages), "Language:", language);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please top up your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Error connecting to AI service." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI gateway response OK, streaming...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});