/**
 * This example demonstrates basic text-to-speech conversion using OpenAI.
 * It converts a simple text message into spoken audio and plays it back
 * using @mastra/node-audio for playback and @mastra/voice-openai for synthesis.
 */

import { playAudio } from "@mastra/node-audio";
import { OpenAIVoice } from "@mastra/voice-openai";

async function textToSpeechUsage() {
    const voice = new OpenAIVoice()

    const audioStream = await voice.speak('Hello, how are you doing today?', {
        responseFormat: 'wav',
    })

    playAudio(audioStream)
}

textToSpeechUsage().catch(console.error)