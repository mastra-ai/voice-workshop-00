# Mastra Voice Workshop

This repository demonstrates how to use Mastra for building voice-enabled applications, showcasing speech-to-text, text-to-speech, and voice-to-voice capabilities. It provides the building blocks to help you get started with creating voice agents using Mastra.

## Prerequisites

- Node.js
- A microphone for speech input
- Speakers or headphones for audio output

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and configure your API keys:
   ```bash
   cp .env.sample .env
   ```

## Workshop Structure

The workshop consists of four progressive lessons:

1. **Speech to Text** (`src/lessons/01-speech-to-text`)
   - Learn how to capture voice input and convert it to text
   - Understand basic speech recognition concepts

2. **Text to Speech** (`src/lessons/02-text-to-speech`)
   - Convert text responses to spoken audio
   - Explore different voice options and configurations

3. **Agent Turns** (`src/lessons/03-turns`)
   - Create conversational flows between agents
   - Manage turn-taking in conversations

4. **Speech to Speech** (`src/lessons/04-speech-to-speech`)
   - Implement real-time voice conversations
   - Build complete voice-to-voice interactions

## Key Technologies

- [@mastra/node-audio](https://github.com/mastra-ai/node-audio): Audio utilities for microphone input and audio playback
- [@mastra/voice-deepgram](https://github.com/mastra-ai/mastra/tree/main/voice/deepgram): Speech-to-text capabilities
- [@mastra/voice-openai](https://github.com/mastra-ai/mastra/tree/main/voice/openai): Text-to-speech synthesis
- [@mastra/voice-openai-realtime](https://github.com/mastra-ai/mastra/tree/main/voice/openai-realtime-api): Real-time voice processing

## Running the Lessons

To run any lesson file, use:

```bash
npx bun path/to/file
```

For example:
```bash
npx bun src/lessons/01-speech-to-text/01-base.ts
```

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
