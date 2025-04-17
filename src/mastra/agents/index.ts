import { openai } from '@ai-sdk/openai';
import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime';
import { z } from 'zod';
import { OpenAIVoice } from '@mastra/voice-openai';

export const webSearchAgent = new Agent({
    name: "Web Search Agent",
    instructions: "You are a Voice agent tasked as a web search assistant that can help users with their tasks. Do not include markdown links in your responses.",
    model: openai.responses("gpt-4.1"),
    voice: new OpenAIVoice({
        speaker: "alloy"
    }),
    tools: {
        search: openai.tools.webSearchPreview()
    }
})

// Have the agent do something
export const speechToSpeechServer = new Agent({
    name: 'mastra',
    instructions: 'You are a helpful assistant.',
    voice: new OpenAIRealtimeVoice(),
    model: openai('gpt-4o'),
    tools: {
        salutationTool: createTool({
            id: 'salutationTool',
            description: 'Read the result of the tool',
            inputSchema: z.object({ name: z.string() }),
            outputSchema: z.object({ message: z.string() }),
            execute: async ({ context }) => {
                return { message: `Hello ${context.name}!` }
            }
        })
    }
});


export const optimistAgent = new Agent({
    name: "Optimist",
    instructions: "You are an optimistic debater who sees the positive side of every topic. Keep your responses concise and engaging, about 2-3 sentences.",
    model: openai("gpt-4o"),
    voice: new OpenAIVoice({
        speaker: "alloy"
    }),
});

export const skepticAgent = new Agent({
    name: "Skeptic",
    instructions: "You are a RUDE skeptical debater who questions assumptions and points out potential issues. Keep your responses concise and engaging, about 2-3 sentences.",
    model: openai("gpt-4o"),
    voice: new OpenAIVoice({
        speaker: "echo"
    }),
});