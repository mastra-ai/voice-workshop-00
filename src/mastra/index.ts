
import { Mastra } from '@mastra/core';
import { speechToSpeechServer, voiceEnabledAgent } from './agents';

export const mastra = new Mastra({
    agents: {
        speechToSpeechServer,
        voiceEnabledAgent
    }
})
