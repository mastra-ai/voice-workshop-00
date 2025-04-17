# Mastra Voice Workshop Lessons

## Introduction

Voice enabled agents are becoming increasingly popular. Rather than be a "Voice" Agent Framework, we are adding the ability to bring Voice to your agents. The term "Voice" is a bit overloaded, so let's walk through the different pieces involved.

This workshop demonstrates how to add these voice capabilities to your Mastra agents through a series of progressive lessons. Each lesson builds upon the previous one, introducing new concepts and features.

## Voice Capabilities Overview

Mastra provides a unified API for voice interactions that includes:

- **Text-to-Speech (TTS)**: Convert text to natural-sounding speech
- **Speech-to-Text (STT)**: Convert spoken audio to text
- **Speech-to-Speech (STS)**: Enable real-time voice conversations

## Lesson 1: Text to Speech

### Examples:
- **base.ts**: Basic text-to-speech conversion
  - Using OpenAI's voice provider
  - Configuring voice settings
  - Using the `speak` method
  - [Available providers](https://mastra.ai/docs/voice/text-to-speech#available-providers)

- **agent.ts**: Adding voice to agents
  - Integrating voice with Mastra agents
  - Using `agent.voice.speak()`
  - Customizing speech parameters

## Lesson 2: Speech to Text

### Examples:
- **base.ts**: Basic speech recognition
  - Using OpenAI's voice provider
  - Using the `listen` method
  - Processing audio files
  - [Available providers](https://mastra.ai/docs/voice/speech-to-text#available-providers)

- **agent.ts**: Adding voice recognition to agents
  - Integrating voice with Mastra agents
  - Using `agent.voice.listen()`
  - Interactive microphone input

## Lesson 3: Agent Conversations

### Examples:
- **debate.ts**: Multi-agent conversation system
  - Two agents with different perspectives (Optimist and Skeptic)
  - Turn-based conversation flow
  - Audio recording and playback
  - Interactive topic selection

## Lesson 4: Speech to Speech

### Examples:
- **base.ts**: Complete voice conversation system
  - Real-time voice conversation with agents
  - Conversation recording and management
  - Cloud storage integration (Cloudinary)
  - Analytics integration (Roark)
  - Event-driven lifecycle hooks
