import { DeepgramVoice } from "@mastra/voice-deepgram";
import { OpenAIVoice } from "@mastra/voice-openai";
import { OpenAIRealtimeVoice } from "@mastra/voice-openai-realtime";

export const deepgramVoice = new DeepgramVoice()
deepgramVoice.speak('Hello, how are you doing today?')

export const openAIVoice = new OpenAIVoice()
openAIVoice.speak('Hello, how are you doing today?')

export  const openAIRealtimeVoice = new OpenAIRealtimeVoice()
openAIRealtimeVoice.speak('Hello, how are you doing today?')
