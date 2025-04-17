# Mastra Voice Workshop Lessons

## Introduction

Voice enabled agents are becoming increasingly popular. Rather than be a "Voice" Agent Framework, we are adding the ability to bring Voice to your agents. The term "Voice" is a bit overloaded, so let's walk through the different pieces involved.

This workshop demonstrates how to add these voice capabilities to your Mastra agents through a series of progressive lessons. Each lesson builds upon the previous one, introducing new concepts and features.

## Voice Capabilities Overview

Mastra provides a unified API for voice interactions that includes:

- **Text-to-Speech (TTS)**: Convert text to natural-sounding speech
  - Multiple provider options (OpenAI, Azure, etc.)
  - Customizable voice characteristics
  
- **Speech-to-Text (STT)**: Convert spoken audio to text
  - Real-time transcription
  - Support for various audio formats
  
- **Speech-to-Speech (STS)**: Enable real-time voice conversations
  - Direct audio-to-audio conversion
  - Real-time streaming capabilities

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

## Speech to Text

- base.ts
  - Introduce a Mastra Voice provider `OpenAI`, you can use many providers.
  - Full list is [here](https://mastra.ai/docs/voice/speech-to-text#available-providers)
  - Introduce the `listen` method
- agent.ts
  - Show adding voice to an Agent.
  - Introduce the `listen` method on `agent.voice`
