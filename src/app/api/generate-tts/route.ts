import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Pollinations API settings
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || '';

// OpenAI Audio voices
const OPENAI_VOICES = ['nova', 'shimmer', 'alloy', 'echo', 'fable', 'onyx'];

export async function POST(request: NextRequest) {
  try {
    // Get user session from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { text, voice = 'nova' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Validate voice
    const selectedVoice = OPENAI_VOICES.includes(voice) ? voice : 'nova';

    // Clean text - remove AI chat phrases and make it direct
    let cleanText = text
      .replace(/^(sure|here's|here is|here are|let me|i'll|i will|i can|based on|according to)/gi, '')
      .replace(/^(the|this|these)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Use Pollinations API with openai-audio model
    const encodedText = encodeURIComponent(cleanText);
    const params = new URLSearchParams();
    if (POLLINATIONS_API_KEY) {
      params.append('key', POLLINATIONS_API_KEY);
    }
    params.append('model', 'openai-audio');
    params.append('voice', selectedVoice);
    
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedText}?${params.toString()}`;
    
    console.log("[TTS] Generating audio with voice:", selectedVoice);
    console.log("[TTS] Text length:", text.length);
    console.log("[TTS] API key present:", !!POLLINATIONS_API_KEY);
    console.log("[TTS] API URL (key masked):", apiUrl.replace(/key=[^&]+/, 'key=***'));
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      },
    });

    if (!response.ok) {
      console.error("[TTS] API request failed with status:", response.status);
      throw new Error(`TTS API request failed with status ${response.status}`);
    }

    // Get audio as blob
    const audioBlob = await response.blob();
    
    // Convert blob to base64 for easy storage/transmission
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log("[TTS] Audio generated successfully, size:", audioBlob.size);

    return NextResponse.json({ 
      success: true,
      audioUrl: audioDataUrl,
      voice: selectedVoice,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[TTS] Error generating audio:", error);
    return NextResponse.json(
      { error: "Failed to generate audio", details: String(error) },
      { status: 500 }
    );
  }
}

