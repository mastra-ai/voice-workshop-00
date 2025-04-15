
import { Mastra } from '@mastra/core';
import { optimistAgent, skepticAgent, speechToSpeechServer, voiceEnabledAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        speechToSpeechServer,
        voiceEnabledAgent,
        optimistAgent,
        skepticAgent,
    }
})
