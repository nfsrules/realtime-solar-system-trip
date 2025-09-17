import { DEFAULT_SOLAR_SYSTEM_LYRICS } from "@/lib/default-lyrics";

// Generate a song using Sonauto API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { lyrics } = body;
    const { tags } = body;

    // Use default French lyrics if undefined or invalid
    if (!lyrics || lyrics === 'undefined' || lyrics.length < 10) {
      console.log("Using default French lyrics for Air Liquide kids");
      lyrics = DEFAULT_SOLAR_SYSTEM_LYRICS;
    }

    console.log("Song generation request:", {
      lyrics: lyrics?.substring(0, 100) + "...",
      tags: tags
    });

    const apiKey = process.env.SONAUTO_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Sonauto API key not configured" }),
        { status: 500 }
      );
    }

    const response = await fetch("https://api.sonauto.ai/v1/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lyrics: lyrics,
        tags: tags || ["pop", "electronic", "happy"]
        // DON'T include prompt when we have both lyrics and tags
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Sonauto API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate song" }),
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Song generated:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Failed to generate song:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}