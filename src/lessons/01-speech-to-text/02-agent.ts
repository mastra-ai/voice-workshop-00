/**
 * This example demonstrates an interactive speech-to-text application using Mastra agents.
 * It captures live microphone input, transcribes the speech, and generates an AI response.
 * Features:
 * - Real-time microphone recording using @mastra/node-audio
 * - Interactive CLI interface with @clack/prompts
 * - AI agent response generation
 */

import { mastra } from "../../mastra";
import { getMicrophone } from "@mastra/node-audio";
import * as p from "@clack/prompts";
import chalk from "chalk";

const agent = mastra.getAgent('webSearchAgent')

async function speechToTextWithAgent() {
    p.intro(chalk.bold('Speech-to-Text Agent Demo'));
    
    // Get microphone stream and start recording immediately
    const { stream: audioStream, mic } = getMicrophone();
    
    // Show that audio is recording
    p.log.info(chalk.blue('Audio recording is active. Start speaking now...'));
    
    // Use clack/prompts to let the user signal when to stop recording
    const stopRecording = await p.confirm({
        message: 'Press Y when you are done speaking to start transcription',
    });
    
    // Stop the microphone
    mic.stop();
    
    if (!stopRecording) {
        p.cancel('Transcription cancelled.');
        return;
    }
    
    if (p.isCancel(stopRecording)) {
        p.cancel('Operation cancelled.');
        return;
    }
    
    // Show a spinner while transcribing
    const s = p.spinner();
    s.start('Transcribing your speech...');
    
    // Use the agent's voice API to transcribe the audio
    const transcript = await agent.voice.listen(audioStream);
    
    s.stop('Transcription complete');
    
    // Display the transcription result
    p.log.success(`You said: ${chalk.green(transcript)}`);
    
    // Generate a response based on the transcript
    s.start('Generating response...');
    const { text } = await agent.generate(`Respond to what the user said: ${transcript}`);
    s.stop('Response generated');
    
    // Display the agent's response
    p.log.info(`${chalk.yellow('Agent response:')} ${text}`);
}

speechToTextWithAgent().catch(console.error);
