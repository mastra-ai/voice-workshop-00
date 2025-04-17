## Introduction

- Voice enabled agents are becoming increasingly popular.
- Rather than be a "Voice" Agent Framework. We are adding the ability to bring Voice to your agents.
- Levels of Voice Agents. The term "Voice" is a bit overloaded. Let's walk through the different pieces involved.

## Voice

- Unified API
  - TTS (Text-to-Speech) for synthesizing spoken audio from text using various providers
  - STT (Speech-to-Text) for transcribing audio to text
  - STS (Speech-to-Speech) for converting audio to audio using realtime models

## Text to Speech

- base.ts
  - Introduce a Mastra Voice provider `OpenAI`, you can use many providers.
  - Full list is [here](https://mastra.ai/docs/voice/text-to-speech#available-providers)
  - We want to personify our agents, so we used the word 'speak'
  - Introduce the `speak` method
- agent.ts
  - Show adding voice to an Agent.
  - Introduce the `speak` method on `agent.voice`

## Speech to Text

- base.ts
  - Introduce a Mastra Voice provider `OpenAI`, you can use many providers.
  - Full list is [here](https://mastra.ai/docs/voice/speech-to-text#available-providers)
  - Introduce the `listen` method
- agent.ts
  - Show adding voice to an Agent.
  - Introduce the `listen` method on `agent.voice`


## TODO
- implement tools function
- turns script

- node-audio package
  - playaudio
  - getMicrophone
  - createHuddle
  - https://github.com/mastra-ai/node-audio

- debate
  - more complex TTS example
  - node-audio package
  - capstone TTS