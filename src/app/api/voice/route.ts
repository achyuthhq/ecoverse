import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

// API key configuration
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY || 'cf089c215c654309a258e76aaf3aa218';

// Initialize the client
const client = new AssemblyAI({
  apiKey: ASSEMBLY_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Voice API: Request received');
    
    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('Voice API: No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log(`Voice API: Audio file received, type: ${audioFile.type}, size: ${audioFile.size} bytes`);

    // Create a buffer from the file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Voice API: Buffer created, size: ${buffer.length} bytes`);

    try {
      // Use direct AssemblyAI client for transcription
      // First upload the audio
      console.log('Voice API: Uploading to AssemblyAI directly...');
      const uploadResp = await client.files.upload(buffer);
      
      console.log('Voice API: Upload successful, transcribing...');
      
      // Then transcribe it
      const transcript = await client.transcripts.transcribe({
        audio: uploadResp,
      });

      if (!transcript || !transcript.text) {
        console.error('Voice API: No transcription returned');
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
      }

      console.log(`Voice API: Transcription successful: "${transcript.text}"`);
      
      // Return the transcription
      return NextResponse.json({ 
        text: transcript.text 
      });
    } catch (assemblyError) {
      console.error('Voice API: AssemblyAI error:', assemblyError);
      
      // Fallback to manual API call if client library fails
      console.log('Voice API: Trying fallback method...');
      const text = await manualTranscription(buffer, audioFile.type);
      
      return NextResponse.json({ 
        text: text 
      });
    }
  } catch (error) {
    console.error('Voice API: Error processing voice:', error);
    return NextResponse.json({ 
      error: 'Failed to process voice recording',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Fallback manual transcription using direct API calls
async function manualTranscription(buffer: Buffer, contentType: string): Promise<string> {
  try {
    // 1. Upload the file
    const uploadUrl = await uploadAudioToAssemblyAI(buffer, contentType);
    console.log(`Voice API Fallback: Upload successful, URL: ${uploadUrl}`);
    
    // 2. Start transcription
    const transcriptId = await startTranscription(uploadUrl);
    console.log(`Voice API Fallback: Transcription started, ID: ${transcriptId}`);
    
    // 3. Poll for results
    const result = await pollTranscriptionResult(transcriptId);
    console.log(`Voice API Fallback: Transcription completed: "${result}"`);
    
    return result;
  } catch (error) {
    console.error('Voice API Fallback: Error in manual transcription:', error);
    throw error;
  }
}

// Helper function to upload audio to AssemblyAI
async function uploadAudioToAssemblyAI(buffer: Buffer, contentType: string): Promise<string> {
  try {
    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'audio/webm',
        'Authorization': `Bearer ${ASSEMBLY_API_KEY}`
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Voice API: Upload failed with status ${response.status}: ${errorText}`);
      throw new Error(`Failed to upload audio: ${response.statusText}`);
    }

    const data = await response.json();
    return data.upload_url;
  } catch (error) {
    console.error('Voice API: Error in uploadAudioToAssemblyAI:', error);
    throw error;
  }
}

// Start a transcription job
async function startTranscription(audioUrl: string): Promise<string> {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ASSEMBLY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: 'en_us'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start transcription: ${errorText}`);
  }

  const data = await response.json();
  return data.id;
}

// Poll for transcription results
async function pollTranscriptionResult(transcriptId: string): Promise<string> {
  let status = 'processing';
  let result = '';
  
  while (status === 'queued' || status === 'processing') {
    // Wait a bit before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': `Bearer ${ASSEMBLY_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get transcription status: ${errorText}`);
    }

    const data = await response.json();
    status = data.status;
    
    if (status === 'completed') {
      result = data.text;
      break;
    } else if (status === 'error') {
      throw new Error(`Transcription error: ${data.error}`);
    }
    
    console.log(`Voice API Fallback: Polling status: ${status}`);
  }
  
  return result;
} 