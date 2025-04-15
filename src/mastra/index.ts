
import { Mastra } from '@mastra/core';
import { speechToSpeechServer, textToSpeech } from './agents';

export const mastra = new Mastra({
    agents: {
        speechToSpeechServer,
        textToSpeech
    }
})
