/**
 * This example demonstrates a multi-agent conversation system using Mastra.
 * Features:
 * - Two AI agents (optimist and skeptic) engage in a debate on a user-chosen topic
 * - Turn-based conversation flow with context awareness
 * - Text-to-speech synthesis for each agent's responses
 * - Audio recording of the entire debate
 * - Interactive user control over debate duration
 */

import { mastra } from '../../mastra';
import { playAudio, Recorder } from '@mastra/node-audio';
import * as p from '@clack/prompts';
import { Agent } from '@mastra/core/agent';

// Helper function to format text with line wrapping
function formatText(text: string, maxWidth: number): string {
    const words = text.split(' ');
    let result = '';
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            result += (result ? '\n' : '') + currentLine;
            currentLine = word;
        }
    }

    if (currentLine) {
        result += (result ? '\n' : '') + currentLine;
    }

    return result;
}

const recorder = new Recorder({
    outputPath: './debate.mp3'
});

// Process one turn of the conversation
async function processTurn(agent: Agent, otherAgentName: string, topic: string, previousResponse: string = "") {
    const spinner = p.spinner();
    spinner.start(`${agent.name} is thinking...`);

    let prompt;
    if (!previousResponse) {
        // First turn
        prompt = `Discuss this topic: ${topic}. Introduce your perspective on it.`;
    } else {
        // Responding to the other agent
        prompt = `The topic is: ${topic}. ${otherAgentName} just said: "${previousResponse}". Respond to their points.`;
    }

    // Generate text response
    const { text } = await agent.generate(prompt, {
        temperature: 0.9
    });
    spinner.message(`${agent.name} is speaking...`);

    // Convert to speech and play
    const audioStream = await agent.voice.speak(text, {
        speed: 1.2,
        responseFormat: "wav", // Optional: specify a response format
    });

    audioStream!.on('data', (chunk) => {
        recorder.write(chunk);
    })

    spinner.stop(`${agent.name} said:`);

    // Format the text to wrap at 80 characters for better display
    const formattedText = formatText(text, 80);
    p.note(formattedText, agent.name);

    const speaker = playAudio(audioStream!);

    await new Promise<void>((resolve) => {
        speaker.once("close", () => {
            resolve();
        });
    });

    return text;
}

// Main function to run the debate
async function runDebate() {
    recorder.start();

    p.intro('AI Debate - Two Agents Discussing a Topic');

    // Get the topic from the user
    const topic = await p.text({
        message: 'Enter a topic for the agents to discuss:',
        placeholder: 'Climate change',
        validate(value) {
            if (!value) return 'Please enter a topic';
            return;
        },
    });

    // Exit if cancelled
    if (p.isCancel(topic)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
    }

    // Create the debate agents
    const optimist = mastra.getAgent('optimistAgent');
    const skeptic = mastra.getAgent('skepticAgent');

    p.log.info(`Starting a debate on: ${topic}`);
    p.log.info('The debate will continue for 1 turn each. Press Ctrl+C to exit at any time.');

    // Run the debate for a few turns
    let agent1Response = "";
    let agent2Response = "";

    for (let turn = 1; turn <= 3; turn++) {
        p.log.step(`Turn ${turn}`);

        // Agent 1's turn
        agent1Response = await processTurn(optimist, skeptic.name, topic as string, agent2Response);

        // Agent 2's turn
        agent2Response = await processTurn(skeptic, optimist.name, topic as string, agent1Response);
    }

    // Ask if the user wants to continue the debate
    const shouldContinue = await p.confirm({
        message: 'Would you like to continue the debate for more turns?',
    });

    if (shouldContinue) {
        // Continue for more turns
        for (let turn = 4; turn <= 6; turn++) {
            p.log.step(`Turn ${turn}`);

            // Agent 1's turn
            agent1Response = await processTurn(optimist, skeptic.name, topic as string, agent2Response);

            // Agent 2's turn
            agent2Response = await processTurn(skeptic, optimist.name, topic as string, agent1Response);
        }
    }

    p.outro('Debate concluded! Thanks for listening.');
}

// Run the debate
runDebate().catch((error) => {
    p.log.error('An error occurred:');
    console.error(error);
    process.exit(1);
});
