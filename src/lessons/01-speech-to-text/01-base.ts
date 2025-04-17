/**
 * This example demonstrates basic speech-to-text conversion using OpenAI.
 * It reads an audio file and transcribes its content to text using @mastra/voice-openai.
 */

import { OpenAIVoice } from "@mastra/voice-openai";
import { createReadStream } from "fs";
import path from "path";

async function speechToTextUsage() {
    const voice = new OpenAIVoice()

    const audioStream = createReadStream(path.join(__dirname, './audio.mp3'))

    const transcript = await voice.listen(audioStream)

    console.log(transcript)
}

speechToTextUsage().catch(console.error)