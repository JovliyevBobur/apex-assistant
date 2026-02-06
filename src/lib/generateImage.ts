const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export interface GeneratedImageResult {
  text: string;
  images: Array<{
    type: string;
    image_url: { url: string };
  }>;
}

export async function generateImage(prompt: string): Promise<GeneratedImageResult> {
  const resp = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || "Rasm yaratishda xatolik");
  }

  return resp.json();
}
