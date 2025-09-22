import { AssemblyAI } from "assemblyai";

// API key configuration
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY || 'cf089c215c654309a258e76aaf3aa218';

// Initialize the client
const client = new AssemblyAI({
  apiKey: ASSEMBLY_API_KEY,
});

/**
 * Upload an audio blob to catbox.moe and returns the URL
 * @param audioBlob - The audio blob to upload
 * @returns The URL of the uploaded audio file
 */
export async function uploadAudioToCatbox(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', audioBlob, 'audio.mp3');

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to catbox.moe: ${response.statusText}`);
    }

    const fileUrl = await response.text();
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to catbox.moe:', error);
    throw error;
  }
}

/**
 * Transcribes audio from a URL using AssemblyAI
 * @param audioUrl - URL of the audio file to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
    });
    
    if (!transcript.text) {
      throw new Error('No transcription result returned');
    }
    
    return transcript.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Handles the complete voice recognition process:
 * 1. Uploads the audio to catbox.moe
 * 2. Transcribes the audio using AssemblyAI
 * @param audioBlob - The recorded audio blob
 * @returns The transcribed text
 */
export async function processVoiceRecording(audioBlob: Blob): Promise<string> {
  // Upload the audio file to catbox.moe
  const audioUrl = await uploadAudioToCatbox(audioBlob);
  
  // Transcribe the audio using AssemblyAI
  const transcription = await transcribeAudio(audioUrl);
  
  return transcription;
} 