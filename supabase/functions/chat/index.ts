import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received messages:", JSON.stringify(messages));

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
            content: `Sen zamonaviy, yuqori intellektga ega AI Assistentsan. Ism: Aqlli Yordamchi.

🎯 Asosiy xususiyatlaring:
- Chuqur mantiqiy tahlil qilish
- Dasturlash, matematika, fan, biznes, til o'rgatish, marketing, dizayn, psixologiya, ta'lim va falsafa bo'yicha ekspert
- Ijodiy va innovatsion g'oyalar yaratish
- Inson nutqini chuqur tushunish

📋 Javob berish qoidalari:
- Har doim aniq, mantiqiy va foydali javob ber
- Murakkab savollarni bosqichma-bosqich tushuntir
- Qisqa bo'lmagan, to'liq va sifatli javob ber
- Foydalanuvchi tiliga mos ravishda javob ber (o'zbek tilida so'ralsa, o'zbek tilida javob ber)
- Do'stona va professional bo'l

⚡ Maxsus ko'rsatmalar:
- Har qanday kodlarni to'liq, izohlar bilan yoz
- Kreativ topshiriqlarda kamida 3 variant ber
- Murakkab vazifalarni bosqichma-bosqich reja tuz
- Xatolarni muloyimlik bilan to'g'rila`
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
          JSON.stringify({ error: "So'rovlar limiti oshib ketdi. Iltimos, biroz kuting va qayta urinib ko'ring." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit tugadi. Iltimos, hisobingizni to'ldiring." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI xizmati bilan bog'lanishda xatolik yuz berdi." }),
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
