
import { Mastra } from '@mastra/core';
import { optimistAgent, skepticAgent, speechToSpeechServer, voiceEnabledAgent, webSearchAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        webSearchAgent,
        speechToSpeechServer,
        voiceEnabledAgent,
        optimistAgent,
        skepticAgent,
    }
})
