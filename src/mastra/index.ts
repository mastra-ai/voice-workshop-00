
import { Mastra } from '@mastra/core';
import { optimistAgent, skepticAgent, speechToSpeechServer, agent, webSearchAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        agent,
        speechToSpeechServer,
        optimistAgent,
        skepticAgent,
        webSearchAgent
    }
})
