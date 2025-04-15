import { openai } from '@ai-sdk/openai';
import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime';
import { z } from 'zod';
import { OpenAIVoice } from '@mastra/voice-openai';

export const voiceEnabledAgent = new Agent({
    name: "Voice Agent",
    instructions: "You are a voice assistant that can help users with their tasks.",
    model: openai("gpt-4o"),
    voice: new OpenAIVoice({
        speechModel: {
            apiKey: process.env.OPENAI_API_KEY
        }
    }),
    tools: {
        fakeTool: createTool({
            id: 'fakeTool',
            description: 'Read the result of the tool',
            inputSchema: z.object({ name: z.string() }),
            outputSchema: z.object({ message: z.string() }),
            execute: async ({ context }) => {
                return { message: `Hello ${context.name} you are fake.` }
            }
        })
    }
});


// Have the agent do something
export const speechToSpeechServer = new Agent({
    name: 'mastra',
    instructions: 'You are a helpful assistant.',
    voice: new OpenAIRealtimeVoice(),
    model: openai('gpt-4o'),
    tools: {
        fakeTool: createTool({
            id: 'fakeTool',
            description: 'Read the result of the tool',
            inputSchema: z.object({ name: z.string() }),
            outputSchema: z.object({ message: z.string() }),
            execute: async ({ context }) => {
                return { message: `Hello ${context.name} you are fake.` }
            }
        })
    }
});
