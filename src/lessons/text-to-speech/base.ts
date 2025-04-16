import { playAudio } from "@mastra/node-audio";
import { OpenAIVoice } from "@mastra/voice-openai";

async function textToSpeechUsage() {
    const voice = new OpenAIVoice()

    const audioStream = await voice.speak('Hello, how are you?', {
        responseFormat: 'wav',
    })

    playAudio(audioStream)
}

textToSpeechUsage().catch(console.error)