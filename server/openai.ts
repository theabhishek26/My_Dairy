import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioFilePath: string): Promise<{ text: string, duration?: number }> {
  try {
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
    });

    return {
      text: transcription.text,
      duration: transcription.duration || 0,
    };
  } catch (error) {
    console.error('OpenAI transcription error:', error);
    throw new Error('Failed to transcribe audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function analyzeEntryContent(text: string): Promise<{
  sentiment: string;
  mood: string;
  tags: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a diary entry analyzer. Analyze the sentiment, mood, and suggest relevant tags for this diary entry. Respond with JSON in this format: { 'sentiment': 'positive/negative/neutral', 'mood': 'happy/sad/excited/calm/anxious/etc', 'tags': ['tag1', 'tag2', 'tag3'] }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      sentiment: result.sentiment || 'neutral',
      mood: result.mood || 'calm',
      tags: result.tags || [],
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return {
      sentiment: 'neutral',
      mood: 'calm',
      tags: [],
    };
  }
}