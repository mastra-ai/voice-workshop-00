
import { Mastra } from '@mastra/core';
import { optimistAgent, skepticAgent, speechToSpeechServer, webSearchAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        webSearchAgent,
        speechToSpeechServer,
        optimistAgent,
        skepticAgent,
    }
})
